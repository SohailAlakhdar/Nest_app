import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductModel } from 'src/DB/models/product.model';
import { CartModel } from 'src/DB/models/cart.model';
import { TokenModel } from 'src/DB/models/token.model';
import { UserModel } from 'src/DB/models/user.model';
import { CartService } from '../cart/cart.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { TokenService } from 'src/commen/services/token.service';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { S3Service } from 'src/commen/services/s3.service';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { BrandModel } from 'src/DB/models/brand.model';
import { OrderModel } from 'src/DB/models/order.model';
import { CouponRepository } from 'src/DB/repository/coupon.repository';
import { CouponModel } from 'src/DB/models/coupon.model';

@Module({
  imports: [OrderModel, UserModel, ProductModel, CartModel, TokenModel, BrandModel, CouponModel],
  controllers: [OrderController],
  providers: [OrderService, CartService, BrandRepository, UserRepository,
    OrderRepository, S3Service, ProductRepository, CartRepository,
     TokenService, TokenRepository, CouponRepository,CartService ],
})
export class OrderModule { }
