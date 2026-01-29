import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from 'src/commen/interfaces/product.interface';

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Product implements IProduct {
    @Prop({ type: Types.ObjectId })
    _id?: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true,
    })
    slug: string;
    
    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    discount?: number;

    @Prop({ unique: true, sparse: true }) // optional but unique if provided
    sku?: string;

    @Prop({ required: true, default: 0 })
    stock: number;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Category' })
    category: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Brand' })
    brand?: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    images?: string[];

    @Prop({ type: Object, default: {} })
    attributes?: { [key: string]: string | number };

    @Prop({ default: true })
    isActive?: boolean;

    @Prop()
    freezedAt?: Date;

    @Prop()
    restoredAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

/**
 *      const finalPrice = product.price * (1 - (product.discount ?? 0) / 100);
const product: IProduct = {
  name: "Wireless Headphones",
  price: 199.99,
  stock: 50,
  sku: "WH-2026-BLK",
  category: new Types.ObjectId("64f0c3e5b2e5a3f1d2c0c7b1"),
  images: ["headphone1.png"],
  isActive: true,
  discount: 10, // <-- 10% discount
};
 */
export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product);



// ---------------------------HOOKS

ProductSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
        console.log(this.slug);

    }
    next();
});

// hooks for update
ProductSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const update = this.getUpdate() as UpdateQuery<ProductDocument>;
    if (update?.$set.name) {
        this.setUpdate({
            ...update,
            slug: slugify(update?.$set.name, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g,
            }),
        });
    }

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
ProductSchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------

export const ProductModel = MongooseModule.forFeature([
    {
        name: Product.name,
        schema: ProductSchema,
    },
]);