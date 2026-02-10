import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { discountTypeEnum } from '../enums/coupon.enum';

export interface ICoupon {
    _id?: Types.ObjectId;

    /** Basic info */
    name: string;                 // "Welcome Offer"
    slug: string;
    image?: string;
    code?: string;                 // "WELCOME10"

    /** Discount */
    discount: number;             // value
    discountType?: discountTypeEnum;

    /** Validity */
    startDate?: Date;
    endDate: Date;
    duration?: number;            // in days

    /** Usage control */
    usageCount?: number;
    maxUsage?: number;
    usedBy?: Types.ObjectId[] | IUser[];

    /** Audit */
    createdBy?: Types.ObjectId | IUser;   // admin/user who created coupon
    updatedBy?: Types.ObjectId | IUser;   // admin/user who last updated it

    /** Timestamps */
    createdAt?: Date;
    updatedAt?: Date;
    freezedAt?: Date;
    restoredAt?: Date;
}
