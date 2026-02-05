import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty, IsPositive } from 'class-validator';
import { CheckUpdateField } from 'src/commen/decorators/update.decorator';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { IsObjectId } from 'src/commen/decorators/mongoDBIds.decorator';

@CheckUpdateField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {

    @IsOptional()
    @IsObjectId({ each: true })
    removedBrands?: Types.ObjectId[]
}
export class CategoryParamsDto {
    @IsMongoId()
    categoryId: Types.ObjectId
}



