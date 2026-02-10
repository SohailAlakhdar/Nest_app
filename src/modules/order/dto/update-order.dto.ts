import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { CheckUpdateField } from 'src/commen/decorators/update.decorator';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';
@CheckUpdateField()
export class UpdateOrderDto extends PartialType(CreateOrderDto) { }

export class OrderParamsDto {
    @IsMongoId()
    orderId: Types.ObjectId
}