import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/commen/services/s3.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserDocument } from 'src/DB/models/user.model';
import { Lean } from 'src/DB/repository/database.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { OrderDocument, OrderProduct } from 'src/DB/models/order.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { CouponDocument } from 'src/DB/models/coupon.model';
import de from 'zod/v4/locales/de.js';
import { OrderStatusEnum } from 'src/commen/enums/order.enum';
import { randomUUID } from 'crypto';
import { discountTypeEnum } from 'src/commen/enums/coupon.enum';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly couponRepository: CouponRepository,
    private readonly cartService: CartService,
    private readonly brandRepository: BrandRepository
  ) { }

  /**
   *
  Usually you calculate:
  subtotal
  discount
  tax
  shipping
  total price

    user: userId,
    products: cart.products,
    totalPrice,
    status: 'PENDING',
    paymentMethod

    1 check the cart and products has length
    2-
   */
  async create(dto: CreateOrderDto, user: UserDocument) {
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
      options:
        { populate: [{ path: 'products.productId', select: 'name' }] }
    });
    if (!cart || cart.products.length === 0) {
      throw new NotFoundException('Cart is empty');
    }
    // calculate total price
    let discount = 0;
    let coupon: any;
    if (dto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: {
          code: dto.coupon,
          endDate: { $gte: new Date() },
          startDate: { $lte: new Date() },
        }
      });
      if (!coupon) {
        throw new NotFoundException('Invalid coupon code');
      }
      if (coupon.duration && coupon.usageCount >= coupon.duration) {
        throw new NotFoundException('Coupon usage limit exceeded');
      }
      // calculat subtotal
      discount = discountTypeEnum.Percent ? coupon.discount : (coupon.discount / cart.totalPrice) * 100;


    }
    let products: OrderProduct[] = [];
    for (const product of cart.products) {
      const productData = await this.productRepository.findOne({
        filter: { _id: product.productId, stock: { $gte: product.quantity } },
      });
      if (!productData) {
        throw new NotFoundException(`Product ${product.productId} is out of stock`);
      }
      products.push({
        productId: product.productId,
        quantity: product.quantity,
        finalTotal: product.price * product.quantity,
        unitPrice: product.price,
      });

    }
    delete dto.coupon;
    const createdOrder = await this.orderRepository.create({
      data: [{
        orderId: randomUUID().slice(0, 8),
        ...dto,
        createdBy: user._id,
        products,
        totalPrice: cart.totalPrice,
        coupon: coupon?._id || null,
        discount,
      }]
    });
    if (!createdOrder || createdOrder.length === 0) {
      throw new BadRequestException('Failed to create order');
    }
    if (coupon) {
      await this.couponRepository.updateOne({
        filter: { _id: coupon._id },
        update: { usageCount: coupon.usageCount + 1 }
      });
    }
    for (const product of cart.products) {
      await this.productRepository.updateOne({
        filter: { _id: product.productId },
        update: { $inc: { stock: -product.quantity } }
      });
    }
    await this.cartService.clearCart(user._id);
    return createdOrder;
  }

}
