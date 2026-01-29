import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, MinLength, validate, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { BrandExistsValidator, IsObjectId } from 'src/commen/decorators/mongoDBIds.decorator';
import { ICategory } from 'src/commen/interfaces/category.interface';

/**
 *
✅ Each value is a valid MongoDB ObjectId

✅ (Optional) The brand actually exists in DB

✅ Reusable across DTOs (Product, Category, etc.)
 */
export class CreateCategoryDto implements Partial<ICategory> {
    @IsString()
    @MinLength(2)
    name: string;


    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsArray()
    @IsObjectId({ each: true })
    brands?: Types.ObjectId[];

}
