import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-cart.dto';
import { UpdateCartProductDto } from './dto/update-cart.dto';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import type { UserDocument } from 'src/DB/models/user.model';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { endPoint } from '../brand/brand.endPoints';
import { successResponse } from 'src/commen/utils/response';
import { CartResponse } from './entities/cart.entity';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { Types } from 'mongoose';
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
@Auth(endPoint.findAll)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }
  @Get()
  async getCart(@UserDecorator() user: UserDocument): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.getCart(user._id);
    return successResponse<CartResponse>({ status: 201, data: { cart } })
  }

  @Post('/create')
  async create(@UserDecorator() user: UserDocument, @Body() dto: AddToCartDto): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.create(user._id, dto);
    return successResponse<CartResponse>({ status: 201, data: { cart } })
  }

  @Patch(':productId/update-item')
  async updateItem(
    @UserDecorator() user: UserDocument,
    @Param('productId') productId: Types.ObjectId,
    @Body() dto: UpdateCartProductDto,
  ): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.updateItem(
      user._id,
      productId,
      dto,
    );
    return successResponse<CartResponse>({ data: { cart } })
  }

  @Delete(':productId/remove-item')
  removeItem(
    @UserDecorator() user: UserDocument,
    @Param('productId') productId: Types.ObjectId
  ) {
    return this.cartService.removeItem(user._id, productId);
  }

  @Delete(':remove-cart')
  async clearCart(
    @UserDecorator() user: UserDocument,
  ) {
    const cart = await this.cartService.clearCart(user._id);
    return successResponse<CartResponse>({ data: { cart } })
  }
}

