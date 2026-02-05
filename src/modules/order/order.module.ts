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

@Module({
  imports: [UserModel, ProductModel, CartModel, TokenModel],
  controllers: [OrderController],
  providers: [OrderService, CartService, UserRepository, ProductRepository, CartRepository, TokenService, TokenRepository],
})
export class OrderModule { }
