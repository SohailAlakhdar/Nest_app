
import { Types } from 'mongoose';
import { IBrand } from './brand.interface';

export interface ICategory {
    _id?: Types.ObjectId;

    name: string;
    slug?: string;
    description?: string;

    image?: string;
    assetFolderId?: string

    brands?: Types.ObjectId[] | IBrand[];

    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    freezedAt?: Date;
    restoredAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}
