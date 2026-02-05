import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { IOrderProduct } from 'src/commen/interfaces/order.interface';
import { PaymentMethodEnum } from 'src/commen/enums/order.enum';

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Object) // ideally map to IOrderProduct DTO
    @IsNotEmpty()
    products: IOrderProduct[];

    @IsNotEmpty()
    @IsEnum(PaymentMethodEnum)
    paymentMethod: PaymentMethodEnum;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    phone: string;

    @IsOptional()
    note?: string;

    @IsNotEmpty()
    userId: Types.ObjectId;
}
