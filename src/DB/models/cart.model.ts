import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document, HydratedDocument, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { ICart, ICartProduct } from 'src/commen/interfaces/cart.interface';
import { IProduct } from 'src/commen/interfaces/product.interface';
import { IUser } from 'src/commen/interfaces/user.interface';

@Schema({ _id: false })
export class CartProduct implements ICartProduct {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId | IProduct;
    @Prop({ required: true, min: 1 })
    quantity: number;
    @Prop({ required: true })
    price: number; // snapshot price
}

export const CartProductSchema =
    SchemaFactory.createForClass(CartProduct);

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Cart implements ICart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    createdBy: Types.ObjectId | IUser;

    @Prop({ type: [CartProductSchema], default: [] })
    products: CartProduct[];

    @Prop({ default: 0 })
    totalPrice: number;

    @Prop({ type: Date })
    freezedAt?: Date;

    @Prop({ type: Date })
    restoredAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

export type CartDocument = HydratedDocument<Cart>;


// ---------------------------HOOKS
// hooks for update
CartSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const query = this.getQuery()
    if (query.paranoid == false || query.paranoId == false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});

// hooks for search
CartSchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------HOOKS

export const CartModel = MongooseModule.forFeature([
    {
        name: Cart.name,
        schema: CartSchema,
    },
]);