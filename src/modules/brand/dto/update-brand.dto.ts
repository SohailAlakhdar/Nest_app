import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty, IsPositive } from 'class-validator';
import { CheckUpdateField } from 'src/commen/decorators/update.decorator';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

@CheckUpdateField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) {

}
export class BrnadParamsDto {
    @IsMongoId()
    brandId: Types.ObjectId
}


