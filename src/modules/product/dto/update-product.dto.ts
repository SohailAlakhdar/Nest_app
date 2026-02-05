import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsNotEmpty, IsPositive } from 'class-validator';
import { CheckUpdateField } from 'src/commen/decorators/update.decorator';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';
import { IsObjectId } from 'src/commen/decorators/mongoDBIds.decorator';

@CheckUpdateField()
export class UpdateProductDto extends PartialType(CreateProductDto) {

}
export class UpdateProductImageDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @IsArray()
    @IsString({ each: true }) // ensures each item in array is a string
    removedFiles?: string[];
}
export class ProductParamsDto {
    @IsObjectId()
    productId: Types.ObjectId
}



