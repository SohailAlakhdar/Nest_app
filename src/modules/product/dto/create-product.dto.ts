import { IProduct } from 'src/commen/interfaces/product.interface';
import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsMongoId,
    IsArray,
    MinLength,
    MaxLength,
    Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';


export class CreateProductDto implements Partial<IProduct> {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    discount?: number;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsMongoId()
    category: Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    brand?: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    attributes?: Record<string, string | number>;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;
}


