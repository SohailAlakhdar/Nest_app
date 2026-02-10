import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CategoryService } from '../category/category.service';
import { S3Service } from 'src/commen/services/s3.service';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { BrandExistsValidator } from 'src/commen/decorators/mongoDBIds.decorator';
import { CategoryModel } from 'src/DB/models/category.model';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { BrandModel } from 'src/DB/models/brand.model';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { CouponModel } from 'src/DB/models/coupon.model';

@Module({
  imports: [CouponModel,CategoryModel, UserModel, TokenModel, BrandModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, CategoryService, S3Service, CategoryRepository,
    TokenService, UserRepository, TokenRepository, BrandRepository, BrandExistsValidator],
})
export class CouponModule { }
