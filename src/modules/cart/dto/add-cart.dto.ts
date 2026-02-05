import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { Types } from 'mongoose';
import type { ICartProduct } from 'src/commen/interfaces/cart.interface';

export class AddToCartDto {
    @IsMongoId()
    productId: Types.ObjectId;

    @Min(1)
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    quantity: number;
}
