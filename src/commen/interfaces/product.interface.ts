import { Types } from "mongoose";
import { ICategory } from "./category.interface";
import { IBrand } from "./brand.interface";


export interface IProduct {
  id?: Types.ObjectId;          // MongoDB ObjectId
  name: string;
  slug: string;
  description?: string;          // Product description
  price: number;                 // Product price
  discount?: number;             // Optional discount in percentage
  salePrice?: number;
  assetFolderId?: string
  sku?: string;                  // Stock Keeping Unit
  stock: number;                 // Available quantity
  category: Types.ObjectId | ICategory;    // Reference to category
  brand?: Types.ObjectId | IBrand;      // Reference to brand (optional)
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


/**
 *
category: Types.ObjectId;
brand?: Types.ObjectId;
category: required reference to Category collection
brand?: optional reference to Brand collection
These act like foreign keys in SQL

attributes: {
  color: "black",
  size: "XL",
  weight: 1.5
}

  price: original price (required)
discount?: optional percentage discount
👉 example: 10 means 10% off

sku: Stock Keeping Unit (internal product code)
stock: available quantity (required)
 */