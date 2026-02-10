import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';
import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { CheckUpdateField } from 'src/commen/decorators/update.decorator';


@CheckUpdateField()
export class UpdateCouponDto extends PartialType(CreateCouponDto) {
    @IsOptional()
    @IsString()
    code?: string
}

export class CouponParamsDto {
    @IsMongoId()
    couponId: Types.ObjectId
}