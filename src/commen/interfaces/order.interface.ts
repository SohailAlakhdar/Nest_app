import { Types } from 'mongoose';
import { OrderStatusEnum, PaymentMethodEnum } from '../enums/order.enum';
import { IProduct } from './product.interface';
import { IUser } from './user.interface';
import { ICoupon } from './coupon.interface';

export interface IOrder {
    _id?: Types.ObjectId;
    orderId: string
    // name: string;
    slug?: string;


    products: IOrderProduct[]
    createdBy: Types.ObjectId | IUser;
    coupon?: string | ICoupon;

    deliveredAt?: Date;

    totalPrice: number;
    discount: number
    subTotal?: number

    paymentMethod: PaymentMethodEnum;
    paymentIntent?: string;

    paidAt?: Date;
    status: OrderStatusEnum;

    address: string;
    phone: string;
    note?: string;

    cancelReason?: string;

    updatedBy?: Types.ObjectId;

    freezedAt?: Date;
    restoredAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
export interface IOrderProduct {
    _id?: Types.ObjectId;
    productId: Types.ObjectId | IProduct
    unitPrice: number;
    finalTotal: number;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}
