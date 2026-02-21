import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UserDocument } from 'src/DB/models/user.model';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { UserRepository } from 'src/DB/repository/user.repository';
import { S3Service } from 'src/commen/services/s3.service';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { FolderPathEnum, storageEnum } from 'src/commen/enums/multer.enum';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { randomUUID } from 'crypto';
import { discountTypeEnum } from 'src/commen/enums/coupon.enum';
import slugify from 'slugify';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { CouponDocument } from 'src/DB/models/coupon.model';
import { Lean } from 'src/DB/repository/database.repository';
import { Types } from 'mongoose';

@Injectable()
export class CouponService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly couponRepository: CouponRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly brandRepository: BrandRepository
  ) { }
  async create(dto: CreateCouponDto, file: Express.Multer.File, user: UserDocument) {
    const existingCoupon = await this.couponRepository.findOne({
      filter: { name: dto.name, paranoid: false },
    });
    if (existingCoupon) throw new ConflictException(
      existingCoupon.freezedAt ? "Dublicate with archived Coupon" : 'Coupon name already exists');

    const startDate = dto.startDate ?? new Date();
    if (startDate >= dto.endDate) throw new BadRequestException("End Date should be after Start Date")

    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: FolderPathEnum.Coupon,
      file,
    })
    const [createdCoupon] = await this.couponRepository.create({
      data: [{
        endDate: dto.endDate,
        startDate,
        code: randomUUID().slice(1, 6),
        discount: dto.discount,
        createdBy: user._id,
        duration: dto.duration,
        discountType: dto.discountType ?? discountTypeEnum.Percent,
        image,
        name: dto.name,
        slug: slugify(dto.name, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      }]
    })
    if (!createdCoupon) {
      await this.s3Service.deleteFile({ Key: image })
      throw new BadRequestException("Fail to create Coupon")
    }
    return createdCoupon;
  }
  // --------------------------------------
  async findAll(data: FindAllDto, archive: boolean = false)
    : Promise<{
      totalDocs: number | undefined;
      totalPages: number | undefined;
      page: number;
      size: number;
      docs: CouponDocument[] | Lean<CouponDocument>[];
    }> {
    const { page, size, search } = data
    const Coupons = await this.couponRepository.paginate({
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
    return Coupons;
  }
  // ----------------------------------------

  async findOne(couponId, archive: boolean = false): Promise<CouponDocument | Lean<CouponDocument>> {
    const coupon = await this.couponRepository.findOne({
      filter: {
        _id: couponId, ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
    })
    if (!coupon) {
      throw new NotFoundException("Coupon not found")
    }
    return coupon;
  }
  // -----------------------------------------
  async updateImage(couponId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<CouponDocument | Lean<CouponDocument>> {
    const existingCoupon = await this.couponRepository.findOne({
      filter: { _id: couponId },
    })
    if (!existingCoupon) throw new NotFoundException("coupon not found");

    // if (existingCoupon.image) await this.s3Service.deleteFile({ Key: existingCoupon.image });

    const image = await this.s3Service.uploadFile({
      storageApproach: storageEnum.disk,
      path: `${FolderPathEnum.Coupon}`,
      file,
    });
    const coupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id: couponId },
      update: { image, updatedBy: user._id },
    })
    if (!coupon) {
      await this.s3Service.deleteFile({ Key: image })
      throw new NotFoundException("coupon not found")
    }
    return coupon;
  }
  // -----------------------------------------

  async update(couponId: Types.ObjectId, dto: UpdateCouponDto, user: UserDocument): Promise<CouponDocument | Lean<CouponDocument>> {
    const coupon = await this.couponRepository.findOne({
      filter: { _id: couponId }
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (dto && await this.couponRepository.findOne({
      filter: {
        name: dto.name,
        _id: { $ne: couponId },
      }
    })) {
      throw new ConflictException('coupon name already exists');
    }
    if (dto.discountType === discountTypeEnum.Percent && dto.discount! > 100) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100%'
      );
    }
    if (dto.code && dto.code !== coupon.code) {
      const exists = await this.couponRepository.findOne({
        filter: { code: dto.code }
      });

      if (exists) {
        throw new BadRequestException('Coupon code already exists');
      }
    }
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ?? coupon.startDate;
      const endDate = dto.endDate ?? coupon.endDate;
      if (startDate >= endDate) {
        throw new BadRequestException(
          'Start date must be before end date'
        );
      }
      if (endDate <= new Date()) {
        throw new BadRequestException(
          'End date must be in the future'
        );
      }
      coupon.startDate = startDate;
      coupon.endDate = endDate;
    }
    const createdCoupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id: couponId },
      update: {
        ...dto,
        updatedBy: user._id
      }
    });
    if (!createdCoupon) {
      throw new NotFoundException("coupon not found")
    }
    return createdCoupon;
  }
  // -----------------------------------------

  async freeze(couponId: Types.ObjectId, user: UserDocument) {
    const coupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id: couponId, freezedAt: { $exists: false } },
      update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id }
    })
    if (!coupon) {
      throw new NotFoundException("coupon not found")
    }
    return "Done";
  }
  // -----------------------------------------

  async restore(couponId: Types.ObjectId, user: UserDocument): Promise<CouponDocument | Lean<CouponDocument>> {
    const coupon = await this.couponRepository.findOneAndUpdate({
      filter: {
        _id: couponId,
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

    if (!coupon) {
      throw new NotFoundException("coupon not found")
    }
    return coupon;
  }
  // -----------------------------------------

  async remove(couponId: Types.ObjectId, user: UserDocument) {
    const coupon = await this.couponRepository.findOneAndDelete({
      filter: { _id: couponId, pranoid: false, freezedAt: { $exists: false } },
    })

    if (!coupon) {
      throw new NotFoundException("coupon not found")
    }
    await this.s3Service.deleteFile({ Key: coupon.image as string })
    return "Done";
  }
  // -----------------------------------------

}
