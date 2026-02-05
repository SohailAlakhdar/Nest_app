import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import {  UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { S3Service } from 'src/commen/services/s3.service';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { UserDocument } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/repository/user.repository';
import { Types } from 'mongoose';
import { BrandDocument } from 'src/DB/models/brand.model';
import { Lean } from 'src/DB/repository/database.repository';
import { IBrand } from 'src/commen/interfaces/brand.interface';
import { FindAllDto } from 'src/commen/dtos/search.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository, private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository) { }

  async create(createBrandDto: CreateBrandDto, user: UserDocument, file: Express.Multer.File) {
    const { name, slogan, description } = createBrandDto
    const existingBrand = await this.brandRepository.findOne({
      filter: { name, paranoid: false },
    });
    if (existingBrand) {
      throw new ConflictException(existingBrand.freezedAt ? "Dublicate with archived Brand" : 'Brand name already exists');
    }
    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: 'Brand',
      file,
    });
    const [brand] = await this.brandRepository.create({
      data: [{
        name: name.trim(),
        slogan: slogan?.trim(),
        description: description?.trim(),
        image,
        createdBy: user._id,
      }],
    });
    if (!brand) {
      await this.s3Service.deleteFile({ Key: image })
    }
    return brand;
  }

  async findAll(data: FindAllDto, archive: boolean = false)
    : Promise<{
      totalDocs: number | undefined;
      totalPages: number | undefined;
      page: number;
      size: number;
      docs: BrandDocument[] | Lean<BrandDocument>[];
    }> {
    const { page, size, search } = data
    const brands = await this.brandRepository.paginate({
      filter: {
        ...(search ? {
          $or:
            [
              { name: { $regex: search, $options: 'i' } },
              { slug: { $regex: search, $options: 'i' } },
              { slogan: { $regex: search, $options: 'i' } },
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
    return brands;
  }
  async findOne(brandId, archive: boolean = false): Promise<BrandDocument | Lean<BrandDocument>> {
    const brand = await this.brandRepository.findOne({
      filter: {
        _id: brandId, ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
    })
    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    return brand;
  }
  async updateImage(brandId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {
    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: 'Brand',
      file,
    });
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: { image, updatedBy: user._id },
      options: { new: false }
    })
    if (!brand) {
      await this.s3Service.deleteFile({ Key: image })
      throw new NotFoundException("Brand not found")
    }
    brand.image ? await this.s3Service.deleteFile({ Key: brand.image }) : true
    brand.image = image;

    return brand;
  }
  async update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {
    if (updateBrandDto && await this.brandRepository.findOne({
      filter: {
        name: updateBrandDto.name, _id: { $ne: brandId },
      }
    })) {
      throw new ConflictException('Brand name already exists');
    }
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: { ...updateBrandDto, updatedBy: user._id }
    })
    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    return brand;
  }
  async freeze(brandId: Types.ObjectId, user: UserDocument) {
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId, freezedAt: { $exists: false } },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id }
    })
    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    return "Done";
  }
  async restore(brandId: Types.ObjectId, user: UserDocument): Promise<BrandDocument | Lean<BrandDocument>> {
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: {
        _id: brandId,
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

    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    return brand;
  }
  async remove(brandId: Types.ObjectId, user: UserDocument) {
    const brand = await this.brandRepository.findOneAndDelete({
      filter: { _id: brandId, pranoid: false, freezedAt: { $exists: false } },
    })

    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    await this.s3Service.deleteFile({ Key: brand.image as string })
    return "Done";
  }
}
