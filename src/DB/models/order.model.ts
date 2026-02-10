import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/commen/enums/order.enum';
import { IOrder, IOrderProduct } from 'src/commen/interfaces/order.interface';

@Schema({ _id: false })
export class OrderProduct implements IOrderProduct {
    @Prop({ required: true })
    name: string;

    @Prop()
    slug?: string;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Product' })
    productId: Types.ObjectId

    @Prop({ required: true })
    unitprice: number;
    @Prop({ required: true })
    finalTotal: number;

    @Prop({ required: true })
    quantity: number;

    @Prop()
    image: string;
}

export const OrderProductSchema =
    SchemaFactory.createForClass(OrderProduct);

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Order implements IOrder {

    @Prop({ required: true, unique: true })
    orderId: string;

    @Prop({
        type: [{ type: OrderProductSchema }],
        required: true,
    })
    products: OrderProduct[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop()
    deliveredAt?: Date;

    @Prop()
    discount: number;
    @Prop({ required: true })
    subTotal: number;

    @Prop({ required: true })
    totalPrice: number;

    @Prop({
        type: String,
        enum: PaymentMethodEnum,
        required: true,
        default: PaymentMethodEnum.CASH
    })
    paymentMethod: PaymentMethodEnum;

    @Prop()
    paymentIntent?: string;

    @Prop({ default: false })
    isPaid?: boolean;

    @Prop()
    paidAt?: Date;

    @Prop({
        type: String,
        enum: OrderStatusEnum,
        default: function (this: Order) {
            return this.paymentMethod == PaymentMethodEnum.CARD ? OrderStatusEnum.CONFIRMED : OrderStatusEnum.PENDING
        },

    })
    status: OrderStatusEnum;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    phone: string;

    @Prop()
    note?: string;

    @Prop()
    cancelReason?: string;

    @Prop({ type: Types.ObjectId })
    createdBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    updatedBy?: Types.ObjectId;

    @Prop()
    freezedAt?: Date;

    @Prop()
    restoredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export type OrderDocument = HydratedDocument<Order>;


// ---------------------------HOOKS
// hooks for update
OrderSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const query = this.getQuery()
    console.log({ query });
    console.log(query.paranoid);
    if (query.paranoid == false || query.paranoId == false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});

// hooks for search
OrderSchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------HOOKS

export const OrderModel = MongooseModule.forFeature([
    {
        name: Order.name,
        schema: OrderSchema,
    },
]);