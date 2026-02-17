import { IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum, Matches, validate, IsString } from 'class-validator';
import { PaymentMethodEnum } from 'src/commen/enums/order.enum';

export class CreateOrderDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    coupon?: string

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
