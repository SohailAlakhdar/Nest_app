import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/commen/services/s3.service';
import { FolderPathEnum, storageEnum } from 'src/commen/enums/multer.enum';
import { UserDocument } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/repository/user.repository';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDocument } from 'src/DB/models/product.model';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { randomUUID } from 'crypto';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { UpdateProductDto, UpdateProductImageDto } from './dto/update-product.dto';

/**
 * | Key        | Value                                                |
| ---------- | ---------------------------------------------------- |
| name       | iPhone 15 Pro                                        |
| price      | 45000                                                |
| stock      | 20                                                   |
| Product   | 65cfa2b8e4b1a9f3e7c2d111                             |
| attributes | `{ "color":"Black","storage":"256GB","weight":187 }` |

 */
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository) { }


  async create(createProductDto: CreateProductDto, user: UserDocument, files: Express.Multer.File[]) {
    if (!await this.productRepository.findOne({
      filter: { _id: createProductDto.category },
    })) {
      throw new NotFoundException("Fail to find matcing Product instance")
    }
    if (!await this.brandRepository.findOne({
      filter: { _id: createProductDto.brand },
    })) {
      throw new NotFoundException("Fail to find matcing brand instance")
    }

    const existingProduct = await this.productRepository.findOne({
      filter: { name: createProductDto.name, paranoid: false },
    });
    if (existingProduct) {
      throw new ConflictException(existingProduct.freezedAt ? "Dublicate with archived Product" : 'Product name already exists');
    }
    if (createProductDto.sku) {
      const existing = await this.productRepository.findOne({ filter: { sku: createProductDto.sku } });
      if (existing) throw new ConflictException('SKU already exists');
    }
    let images: string[] = [];
    let assetFolderId = randomUUID()
    if (files?.length) {
      images = await this.s3Service.uploadFiles({
        storageApproach: storageEnum.disk,
        path: `${FolderPathEnum.Product}/${createProductDto.category}/${FolderPathEnum.Product}/${assetFolderId}`,
        files,
      });
    }
    if (createProductDto.attributes && typeof createProductDto.attributes === 'string') {
      createProductDto.attributes = JSON.parse(createProductDto.attributes);
    }
    const [Product] = await this.productRepository.create({
      data: [{
        ...createProductDto,
        assetFolderId,
        images,
        createdBy: user._id,
      }],
    });

    if (!Product && (images.length !== 0)) {
      await this.s3Service.deleteFiles({ urls: images })
    }
    return Product;
  }
  //-------------------------------------------------------
  async findAll(data: FindAllDto, archive: boolean = false)
    : Promise<{
      totalDocs: number | undefined;
      totalPages: number | undefined;
      page: number;
      size: number;
      docs: ProductDocument[] | Lean<ProductDocument>[];
    }> {
    const { page, size, search } = data
    const Products = await this.productRepository.paginate({
      filter: {
        ...(search ? {
          $or:
            [
              { name: { $regex: search, $options: 'i' } },
              { slug: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ]
        } : {}),
        ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
      options: {
        lean: true,
      },
      page,
      size,
    })
    return Products;
  }

  // ----------------------------------------
  async findOne(productId, archive: boolean = false): Promise<ProductDocument | Lean<ProductDocument>> {
    const Product = await this.productRepository.findOne({
      filter: {
        _id: productId, ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
    })
    if (!Product) {
      throw new NotFoundException("Product not found")
    }
    return Product;
  }
  // -----------------------------------------
  async updateImage(updateProductImageDto: UpdateProductImageDto, productId: Types.ObjectId, files: Express.Multer.File[], user: UserDocument,): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
      options: {
        populate: [
          { path: 'Product', select: 'name _id' }, // populate Product field, only select name & _id
          { path: 'brand', select: 'name _id' },    // populate brand field
        ],
      }
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }
    // 2️⃣ Upload new files (if any)
    let newImages: string[] = [];
    if (files?.length > 0) {
      const assetFolderId = randomUUID();
      newImages = await this.s3Service.uploadFiles({
        storageApproach: storageEnum.disk,
        path: `${FolderPathEnum.Product}/${product.category}/${FolderPathEnum.Product}/${assetFolderId}`,
        files,
      });
    }

    // 3️⃣ Remove files from S3 (if requested)
    if (updateProductImageDto.removedFiles !== undefined && product.images != undefined) {
      const imagesToDelete = product.images.filter(img => updateProductImageDto.removedFiles?.includes(img));
      if (imagesToDelete.length > 0) {
        await this.s3Service.deleteFiles({ urls: imagesToDelete });
      }
    }
    // 4️⃣ Merge final images array
    const finalImages = [...new Set([
      ...(product.images ?? []).filter(img => !updateProductImageDto.removedFiles?.includes(img)),
      ...newImages,
    ])
    ];
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: { images: finalImages, updatedBy: user._id },
      options: {
        populate: [
          { path: 'Product', select: 'name id description' }, // populate Product field, only select name & _id
          { path: 'brand', select: 'name id' },    // populate brand field
        ],
      }
    });
    if (!updatedProduct) {
      throw new NotFoundException("Product not found");
    }
    return updatedProduct;
  }
  //-------------------------------------------------------
  async update(productId: Types.ObjectId, updateProductDto: UpdateProductDto, user: UserDocument): Promise<ProductDocument | Lean<ProductDocument>> {
    if (updateProductDto && await this.productRepository.findOne({
      filter: {
        name: updateProductDto.name,
        _id: { $ne: productId },
      }
    })) {
      throw new ConflictException('Product name already exists');
    }
    console.log({ updateProductDto: updateProductDto });

    if (updateProductDto.category && !await this.productRepository.findOne({
      filter: {
        category: updateProductDto.category,
      }
    })) {
      throw new ConflictException('Fail to find category ID');
    }
    if (updateProductDto.brand && !await this.productRepository.findOne({
      filter: {
        brand: updateProductDto.brand,
      }
    })) {
      throw new ConflictException('Fail to find Brand ID');
    }

    const Product = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: { ...updateProductDto, updatedBy: user._id }
    })
    if (!Product) {
      throw new NotFoundException("Product not found")
    }
    return Product;
  }
  // -----------------------------------------

  async freeze(productId: Types.ObjectId, user: UserDocument) {
    const Product = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId, freezedAt: { $exists: false } },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id }
    })
    if (!Product) {
      throw new NotFoundException("Product not found")
    }
    return "Done";
  }
  // -----------------------------------------

  async restore(productId: Types.ObjectId, user: UserDocument): Promise<ProductDocument | Lean<ProductDocument>> {
    const Product = await this.productRepository.findOneAndUpdate({
      filter: {
        _id: productId,
        paranoid: false,
        freezedAt: { $exists: true },
        restoredAt: { $exists: false },
      },
      update: {
        $unset: { freezedAt: true },
        $set: {
          restoredAt: new Date(),
          updatedBy: user._id,
        },
      },
    })
    if (!Product) {
      throw new NotFoundException("Product not found")
    }
    return Product;
  }
  // -----------------------------------------

  async remove(productId: Types.ObjectId, user: UserDocument) {
    const Product = await this.productRepository.findOneAndDelete({
      filter: { _id: productId, pranoid: false, freezedAt: { $exists: true } },
    })
    if (!Product) {
      throw new NotFoundException("Product not found")
    }
    Product.images ?? await this.s3Service.deleteFiles({ urls: Product.images as unknown as string[] })
    return "Done";
  }
  // -----------------------------------------


  // ------------------wishlist
  async addToWishlist(userId: Types.ObjectId, productId: Types.ObjectId): Promise<UserDocument | Lean<UserDocument>> {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.wishlist.includes(productId)) {
      throw new ConflictException('Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();
    return user;
  }

  async removeFromWishlist(userId: Types.ObjectId, productId: Types.ObjectId): Promise<UserDocument | Lean<UserDocument>> {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const index = user.wishlist.indexOf(productId);
    if (index === -1) throw new NotFoundException('Product not in wishlist');

    user.wishlist.splice(index, 1);
    await user.save();
    return user;
  }

}
