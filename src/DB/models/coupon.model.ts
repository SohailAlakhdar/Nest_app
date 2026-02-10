import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { discountTypeEnum } from 'src/commen/enums/coupon.enum';
import { ICoupon } from 'src/commen/interfaces/coupon.interface';

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Coupon implements ICoupon {
    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @Prop()
    image?: string;

    @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
    code?: string;

    /** Discount */
    @Prop({ required: true, min: 0 })
    discount: number;

    @Prop({ type: String, enum: discountTypeEnum, default: discountTypeEnum.Percent })
    discountType: discountTypeEnum;

    /** Validity */
    @Prop({})
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop({ default: 1 })
    duration?: number;

    /** Usage control */
    @Prop({ default: 0 })
    usageCount: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    usedBy: Types.ObjectId[];

    /** Audit */
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    /** Soft delete / restore */
    @Prop()
    freezedAt?: Date;

    @Prop()
    restoredAt?: Date;
}



export type CouponDocument = HydratedDocument<Coupon>;

export const CouponSchema = SchemaFactory.createForClass(Coupon);



// ---------------------------HOOKS

CouponSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
        console.log(this.slug);
    }
    if (this.endDate && this.endDate.getTime() < Date.now()) {
        this.freezedAt = new Date();
    }
    next();
});

// hooks for update
CouponSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const update = this.getUpdate() as UpdateQuery<CouponDocument>;
    if (update?.name) {
        this.setUpdate({
            ...update,
            slug: slugify(update?.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g, }),
        });
    }
    const query = this.getQuery()
    if (query.paranoid == false || query.paranoId == false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});

// hooks for search
CouponSchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    // console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------

export const CouponModel = MongooseModule.forFeature([
    {
        name: Coupon.name,
        schema: CouponSchema,
    },
]);