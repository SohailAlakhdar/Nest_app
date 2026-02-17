/**
 *
| Method | Endpoint                  | Action          |
| ------ | ------------------------- | --------------- |
| POST   | `/cart/add`               | Add item        |
| PATCH  | `/cart/update/:productId` | Update quantity |
| DELETE | `/cart/remove/:productId` | Remove item     |
| GET    | `/cart`                   | Get user cart   |
| DELETE | `/cart/clear`             | Clear cart      |

 */

import { Types } from "mongoose";
import { IProduct } from "./product.interface";
import { IUser } from "./user.interface";

export interface ICartProduct {
    productId: Types.ObjectId | IProduct;
    quantity: number;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICart {
    _id?: Types.ObjectId;
    createdBy: Types.ObjectId | IUser;
    products: ICartProduct[];
    totalPrice: number;

    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * 5️⃣ Cart UI (What user sees)

Product image

Name

Price

Quantity (+ / -)

Remove button ❌

Total price

Checkout button 🛍️

6️⃣ Best Practices 🔥

Always recalculate price on backend

Prevent negative quantity

One active cart per user

Lock cart after checkout
 */