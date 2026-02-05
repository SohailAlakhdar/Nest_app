import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-Order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
