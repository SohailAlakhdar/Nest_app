import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/commen/services/s3.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserDocument } from 'src/DB/models/user.model';
import { OrderDocument, OrderProduct } from 'src/DB/models/order.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { randomUUID } from 'crypto';
import { discountTypeEnum } from 'src/commen/enums/coupon.enum';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import { PaymentService } from 'src/commen/services/payment.service';
import { ProductDocument } from 'src/DB/models/product.model';
import Stripe from 'stripe';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/commen/enums/order.enum';
import type { Request } from 'express';

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
    private readonly paymentService: PaymentService,
  ) { }

  async create(dto: CreateOrderDto, user: UserDocument): Promise<OrderDocument> {

    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
      options:
        { populate: [{ path: 'products.productId', select: 'name' }] }
    });
    if (!cart || cart.products.length === 0) {
      throw new NotFoundException('Cart is empty');
    }
    // calculate total price
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

    }
    let products: OrderProduct[] = [];
    let total = 0;
    for (const product of cart.products) {
      const productData = await this.productRepository.findOne({
        filter: { _id: product.productId, stock: { $gte: product.quantity } },
      });
      if (!productData) {
        throw new NotFoundException(`Product ${product.productId} is out of stock`);
      }
      const finalTotal = productData.price * product.quantity;
      products.push({
        productId: product.productId,
        quantity: product.quantity,
        finalTotal: finalTotal,
        unitPrice: productData.salePrice || productData.price,
      });
      total += finalTotal;
    }

    delete dto.coupon;
    const [createdOrder] = await this.orderRepository.create({
      data: [{
        ...dto,
        orderId: randomUUID().slice(0, 8),
        createdBy: user._id,
        products,
        totalPrice: total,
        coupon: coupon?._id,
        status: OrderStatusEnum.PENDING,
        discount: coupon?.discountType === discountTypeEnum.Percent ? coupon.discount : (coupon?.discount / cart.totalPrice) * 100 || 0,
      }]
    });

    if (!createdOrder) {
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
    // await this.cartService.clearCart(user._id);
    return createdOrder;
  }

  async checkout(orderId: Types.ObjectId, user: UserDocument): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const order = await this.orderRepository.findOne({
      filter: { _id: orderId, createdBy: user._id, status: OrderStatusEnum.PENDING, paymentMethod: PaymentMethodEnum.CARD },
      options: { populate: [{ path: 'products.productId', select: 'name' }] }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.coupon) {
      const coupon = await this.paymentService.createCoupon({
        name: order.coupon.toString(),
        percent_off: order.discount,
        duration: 'once',
      });
      discounts.push({ coupon: coupon.id });
    }
    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      metadata: { orderId: order._id.toString() },
      discounts,
      line_items: order.products.map((item) => ({
        price_data: {
          currency: 'egp',
          product_data: {
            name: (item.productId as ProductDocument).name,
          },
          unit_amount: item.unitPrice * 100,
        },
        quantity: item.quantity,
      })),
    });
    const method = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });
    const paymentIntent = await this.paymentService.createPaymentIntent({
      amount: order.totalPrice * 100,
      payment_method: method.id,
      currency: 'egp',
      metadata: { orderId: order._id.toString() },
    });
    order.paymentIntent = paymentIntent.id;
    order.save();
    return session;
  }

  async webhook(req: Request, signature: string): Promise<any> {
    console.log("WEBHOOK");
    let event: Stripe.Event = await this.paymentService.webhook(req, signature);
    const orderId = (event as any).data.object.metadata?.orderId as string;
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(orderId),
        status: OrderStatusEnum.PENDING,
        paymentMethod: PaymentMethodEnum.CARD,
      },
      update: {
        paidAt: new Date(),
        status: OrderStatusEnum.CONFIRMED
      }
    });
    if (!order) {
      throw new NotFoundException('Order not found or already processed');
    }
    const paymentIntent = await this.paymentService.confirmPaymentIntent(order?.paymentIntent as string);
    console.log({ paymentIntent });
    return "";
  }

}

