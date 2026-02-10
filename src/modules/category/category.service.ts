import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { S3Service } from 'src/commen/services/s3.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserDocument } from 'src/DB/models/user.model';
import { CategoryDocument } from 'src/DB/models/category.model';
import { Lean } from 'src/DB/repository/database.repository';
import { FolderPathEnum, storageEnum } from 'src/commen/enums/multer.enum';
import { Types } from 'mongoose';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { randomUUID } from 'crypto';
import { FindAllDto } from 'src/commen/dtos/search.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly brandRepository: BrandRepository) { }


  async create(createCategoryDto: CreateCategoryDto, user: UserDocument, file: Express.Multer.File) {
    let { name, description } = createCategoryDto
    const existingCategory = await this.categoryRepository.findOne({
      filter: { name, paranoid: false },
    });
    if (existingCategory) {
      throw new ConflictException(existingCategory.freezedAt ? "Dublicate with archived Category" : 'Category name already exists');
    }

    const brands: Types.ObjectId[] = Array.from(
      new Set(createCategoryDto.brands || [])
    ).map(id => new Types.ObjectId(id));

    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
      throw new NotFoundException("Brand Id is not found ")
    }
    let assetFolderId = randomUUID()
    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: `${FolderPathEnum.Category}/${assetFolderId}`,
      file,
    });
    console.log(createCategoryDto);

    const [Category] = await this.categoryRepository.create({
      data: [{
        // ...createCategoryDto,
        brands,
        name: name.trim(),
        description: description?.trim(),
        assetFolderId: assetFolderId.trim(),
        image,
        createdBy: user._id,
      }],
    });
    if (!Category) {
      await this.s3Service.deleteFile({ Key: image })
    }
    return Category;
  }
  // --------------------------------------
  async findAll(data: FindAllDto, archive: boolean = false)
    : Promise<{
      totalDocs: number | undefined;
      totalPages: number | undefined;
      page: number;
      size: number;
      docs: CategoryDocument[] | Lean<CategoryDocument>[];
    }> {
    const { page, size, search } = data
    const Categorys = await this.categoryRepository.paginate({
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
    return Categorys;
  }
  // ----------------------------------------
  async findOne(categoryId, archive: boolean = false): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId, ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
    })
    if (!category) {
      throw new NotFoundException("Category not found")
    }
    return category;
  }
  // -----------------------------------------
  async updateImage(categoryId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    })
    if (!category) throw new NotFoundException("Category not found");

    if (category.image) await this.s3Service.deleteFile({ Key: category.image });

    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: `${FolderPathEnum.Category}/${category.assetFolderId}`,
      file,
    });
    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: { image, updatedBy: user._id },
    })
    if (!Category) {
      await this.s3Service.deleteFile({ Key: image })
      throw new NotFoundException("Category not found")
    }
    // Category.image ? await this.s3Service.deleteFile({ Key: Category.image }) : true

    return Category;
  }
  // -----------------------------------------

  async update(categoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {
    if (updateCategoryDto && await this.categoryRepository.findOne({
      filter: {
        name: updateCategoryDto.name,
        _id: { $ne: categoryId },
      }
    })) {
      throw new ConflictException('Category name already exists');
    }
    console.log({ updateCategoryDto });

    const brands: Types.ObjectId[] = Array.from(
      new Set(updateCategoryDto.brands || [])
    ).map(id => new Types.ObjectId(id));

    if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
      throw new NotFoundException("Brand Id is not found")
    }
    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: [
        {
          $set: {
            brands: {
              $setUnion: [
                {
                  $setDifference: [
                    { $setUnion: ['$brands', []] },
                    (updateCategoryDto.removedBrands ?? []).map(
                      id => new Types.ObjectId(id),
                    ),
                  ],
                },
                (updateCategoryDto.brands ?? []).map(
                  id => new Types.ObjectId(id),
                ),
              ],
            },
            ...(updateCategoryDto.name && { name: updateCategoryDto.name }),
            ...(updateCategoryDto.description && { description: updateCategoryDto.description }),
            updatedBy: user._id,
          },
        }
      ],
    });
    if (!Category) {
      throw new NotFoundException("Category not found")
    }
    return Category;
  }
  // -----------------------------------------

  async freeze(categoryId: Types.ObjectId, user: UserDocument) {
    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId, freezedAt: { $exists: false } },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id }
    })
    if (!Category) {
      throw new NotFoundException("Category not found")
    }
    return "Done";
  }
  // -----------------------------------------

  async restore(categoryId: Types.ObjectId, user: UserDocument): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: {
        _id: categoryId,
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
    console.log("Re");

    if (!Category) {
      throw new NotFoundException("Category not found")
    }
    return Category;
  }
  // -----------------------------------------

  async remove(categoryId: Types.ObjectId, user: UserDocument) {
    const Category = await this.categoryRepository.findOneAndDelete({
      filter: { _id: categoryId, pranoid: false, freezedAt: { $exists: false } },
    })

    if (!Category) {
      throw new NotFoundException("Category not found")
    }
    await this.s3Service.deleteFile({ Key: Category.image as string })
    return "Done";
  }
  // -----------------------------------------

}
