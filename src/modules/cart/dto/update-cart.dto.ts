import { PartialType } from '@nestjs/mapped-types';
import { AddToCartDto } from './add-cart.dto';
import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class UpdateCartProductDto extends PartialType(AddToCartDto) {
    @IsNumber()
    @Type(() => Number)
    quantity: number;
}
