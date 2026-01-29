import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { IBrand } from 'src/commen/interfaces/brand.interface';

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Brand implements IBrand {
    @Prop({
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 2,
        maxlength: 50,
    })
    name: string;

    @Prop({ type: String, required: false, trim: true })
    description?: string;

    @Prop({ type: String, required: false })
    image?: string;

    @Prop({
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true,
    })
    slug: string;

    @Prop({ type: String, required: false })
    slogan?: string;

    @Prop({ type: Boolean, default: true })
    status?: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    createdBy?: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    updatedBy?: Types.ObjectId;


    @Prop({ type: Date })
    freezedAt?: Date;

    @Prop({ type: Date })
    restoredAt?: Date;
}


export type BrandDocument = HydratedDocument<Brand>;

export const BrandSchema = SchemaFactory.createForClass(Brand);



// ---------------------------HOOKS

BrandSchema.pre('save', function (next) {
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
BrandSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const update = this.getUpdate() as UpdateQuery<BrandDocument>;
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
BrandSchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------

export const BrnadModel = MongooseModule.forFeature([
    {
        name: Brand.name,
        schema: BrandSchema,
    },
]);