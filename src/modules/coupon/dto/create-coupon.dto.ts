import { IsString, IsNumber, IsOptional, IsEnum, IsDate, Min, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { discountTypeEnum } from 'src/commen/enums/coupon.enum';
import { ICoupon } from 'src/commen/interfaces/coupon.interface';

export class CreateCouponDto implements Partial<ICoupon> {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(0)
    discount: number;

    @IsEnum(discountTypeEnum)
    @IsOptional()
    discountType?: discountTypeEnum;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @IsDate()
    @Type(() => Date)
    endDate: Date;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(1)
    @IsOptional()
    duration?: number;
}
