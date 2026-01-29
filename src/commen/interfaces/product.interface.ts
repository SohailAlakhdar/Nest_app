import { Types } from "mongoose";


export interface IProduct {
    _id?: Types.ObjectId;          // MongoDB ObjectId
    name: string;
    slug: string;
    description?: string;          // Product description
    price: number;                 // Product price
    discount?: number;             // Optional discount in percentage
    sku?: string;                  // Stock Keeping Unit
    stock: number;                 // Available quantity
    category: Types.ObjectId;    // Reference to category
    brand?: Types.ObjectId;      // Reference to brand (optional)
    images?: string[];             // Array of image URLs or S3 keys
    attributes?: {                 // Optional custom attributes
        [key: string]: string | number;
    };
    isActive?: boolean;            // If the product is active
    createdAt?: Date;              // Date of creation
    updatedAt?: Date;

    freezedAt?: Date;
    restoredAt?: Date

    createdBy?: Types.ObjectId;    // User who created the product
    updatedBy?: Types.ObjectId;    // User who last updated the product
}