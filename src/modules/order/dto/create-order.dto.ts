import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum, Matches, validate } from 'class-validator';
import { IOrderProduct } from 'src/commen/interfaces/order.interface';
import { PaymentMethodEnum } from 'src/commen/enums/order.enum';
import { IsObjectId } from 'src/commen/decorators/mongoDBIds.decorator';

export class CreateOrderDto {
    @IsObjectId({ each: true })
    products: IOrderProduct[];

    @IsNotEmpty()
    @IsEnum(PaymentMethodEnum)
    paymentMethod: PaymentMethodEnum;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @Matches(/^(?:\+20|0)?1[0125]\d{8}$/, {
        message: 'Invalid Egyptian phone number',
    })
    phone: string;

    @IsOptional()
    note?: string;


}
