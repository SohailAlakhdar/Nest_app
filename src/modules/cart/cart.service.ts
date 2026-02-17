import { BadRequestException, Injectable, NotFoundException, UsePipes, ValidationPipe } from "@nestjs/common";
import { Types } from "mongoose";
import { CartRepository } from "src/DB/repository/cart.repository";
import { ProductRepository } from "src/DB/repository/product.repository";
import { AddToCartDto } from "./dto/add-cart.dto";
import { CartDocument, CartProduct } from "src/DB/models/cart.model";
import { Lean } from "src/DB/repository/database.repository";
import { ProductDocument } from "src/DB/models/product.model";
import { ICart, ICartProduct } from "src/commen/interfaces/cart.interface";
import { UpdateCartProductDto } from "./dto/update-cart.dto";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Injectable()
export class CartService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) { }

  async getCart(userId: Types.ObjectId): Promise<CartDocument> {
    let cart = await this.cartRepository.findOne({
      filter: { createdBy: userId, isActive: true },
    });
    if (!cart) {
      const [createdCart] = await this.cartRepository.create({
        data: [{
          createdBy: userId,
        }],
      });
      if (!createdCart) throw new BadRequestException("Fail to create cart");
      cart = createdCart;
    }
    return cart as CartDocument;
  }

  async create(userId: Types.ObjectId, dto: AddToCartDto): Promise<CartDocument | Lean<CartDocument>> {
    const product = await this.productRepository.findOne({ filter: { _id: dto.productId, stock: { $gte: dto.quantity } } });
    if (!product) throw new NotFoundException('Product not found');
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: userId, isActive: true }
    })
    if (!cart) {
      const newCart = await this.getCart(userId) as CartDocument;
      newCart.products.push({
        productId: dto.productId,
        quantity: dto.quantity,
        price: product.salePrice ? product.salePrice : product.price,
      });
      newCart.totalPrice = this.calculateTotal(newCart.products);
      return newCart.save();
    }
    const existsProduct = cart.products.some(
      (ele) => ele.productId.toString() === dto.productId.toString()
    )

    if (existsProduct) {
      throw new BadRequestException('The product already exists in the cart');
    }
    cart.products.push({
      productId: dto.productId,
      quantity: dto.quantity,
      price: product.salePrice ? product.salePrice : product.price,
    });
    cart.totalPrice = this.calculateTotal(cart.products);
    return cart.save();

  }


  async updateItem(
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    dto: UpdateCartProductDto
  ): Promise<CartDocument> {
    const cart = await this.getCart(userId); // find the cart

    const cartItemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId.toString(),
    );
    if (cartItemIndex === -1) {
      throw new NotFoundException('Product not found inside the cart');
    }
    cart.products[cartItemIndex].quantity += dto.quantity;
    const updatedCart = await this.cartRepository.findOneAndUpdate({
      filter: { _id: cart._id },
      update: { products: cart.products, totalPrice: this.calculateTotal(cart.products) },
      options: { new: true }
    });
    return updatedCart as CartDocument
  }

  async removeItem(userId: Types.ObjectId, productId: Types.ObjectId): Promise<CartDocument> {
    // Pull the product from the cart and recalculate total in one step
    const updatedCart = await this.cartRepository.findOneAndUpdate({
      filter: { createdBy: userId },
      update: {
        $pull: { products: { product: productId } }
      },
    });
    if (!updatedCart) {
      throw new NotFoundException('Cart or product not found');
    }
    // Recalculate total price after removing the item
    updatedCart.totalPrice = this.calculateTotal(updatedCart.products);

    // Save the cart with updated total
    return updatedCart.save();
  }

  async clearCart(userId: Types.ObjectId): Promise<CartDocument> {
    // Pull the product from the cart and recalculate total in one step
    const cart = await this.cartRepository.findOneAndDelete({
      filter: { createdBy: userId },
    });
    if (!cart) {
      throw new NotFoundException('Cart or product not found');
    }
    return cart as CartDocument;
  }



  private calculateTotal(products: CartProduct[]): number {
    return products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

  }
}
