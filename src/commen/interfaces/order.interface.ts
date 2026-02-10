
import { Types } from 'mongoose';
import { IBrand } from './brand.interface';
import { OrderStatusEnum, PaymentMethodEnum } from '../enums/order.enum';
import { IProduct } from './product.interface';

export interface IOrder {
    _id?: Types.ObjectId;
    orderId: string
    // name: string;
    slug?: string;


    products: IOrderProduct[]
    userId: Types.ObjectId


    deliveredAt?: Date;

    totalPrice: number;
    discount: number
    subTotal: number

    paymentMethod: PaymentMethodEnum;
    paymentIntent?: string;

    isPaid?: boolean;
    paidAt?: Date;

    status: OrderStatusEnum;

    address: string;
    phone: string;
    note?: string;

    cancelReason?: string;

    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    freezedAt?: Date;
    restoredAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
export interface IOrderProduct {
    _id?: Types.ObjectId;

    name: string;
    slug?: string;

    productId: Types.ObjectId | IProduct
    unitprice: number;
    finalTotal: number;
    quantity: number;
    image?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
