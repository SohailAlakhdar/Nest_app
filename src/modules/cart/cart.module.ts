import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UserModel } from 'src/DB/models/user.model';
import { ProductModel } from 'src/DB/models/product.model';
import { CartModel } from 'src/DB/models/cart.model';
import { UserRepository } from 'src/DB/repository/user.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { TokenService } from 'src/commen/services/token.service';
import { TokenModel } from 'src/DB/models/token.model';
import { TokenRepository } from 'src/DB/repository/token.repository';

@Module({
  imports: [UserModel, ProductModel, CartModel, TokenModel],
  controllers: [CartController],
  providers: [CartService, UserRepository, ProductRepository, CartRepository, TokenService, TokenRepository],
})
export class CartModule { }
