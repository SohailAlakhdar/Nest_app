
import { Types } from 'mongoose';

export interface IBrand {
    _id?: Types.ObjectId;

    name: string;
    description?: string;

    image?: string;   // image URL
    slug?: string;    // SEO friendly URL
    slogan?: string;  // brand slogan

    status?: boolean;        // active / inactive
    isFeatured?: boolean; // show in featured brands
    
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    freezedAt?: Date;
    restoredAt?: Date

    createdAt?: Date;
    updatedAt?: Date;
}
