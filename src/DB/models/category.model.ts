import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { ICategory } from 'src/commen/interfaces/category.interface';

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Category implements ICategory {
    @Prop({
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 2,
        maxlength: 50,
    })
    name: string;

    @Prop({
        type: String, required: false, trim: true, minlength: 2, maxlength: 5000,
    })
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

    @Prop()
    assetFolderId?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Brand' }] })
    brands?: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    createdBy?: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    updatedBy?: Types.ObjectId;


    @Prop({ type: Date })
    freezedAt?: Date;

    @Prop({ type: Date })
    restoredAt?: Date;
}


export type CategoryDocument = HydratedDocument<Category>;

export const CategorySchema = SchemaFactory.createForClass(Category);



// ---------------------------HOOKS

CategorySchema.pre('save', function (next) {
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
CategorySchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
    const update = this.getUpdate() as UpdateQuery<CategoryDocument>;
    if (update[0]?.name) {
        this.setUpdate({
            ...update,
            slug: slugify(update[0]?.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g, }),
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
CategorySchema.pre(["find", "findOne", 'countDocuments'], async function (next) {
    const query = this.getQuery();
    // console.log({ query: query });
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
});
// ----------------------------------

export const CategoryModel = MongooseModule.forFeature([
    {
        name: Category.name,
        schema: CategorySchema,
    },
]);