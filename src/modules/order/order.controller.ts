import { storageEnum } from 'src/commen/enums/multer.enum';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import type { UserDocument } from 'src/DB/models/user.model';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { successResponse } from 'src/commen/utils/response';
import { OrderResponse } from './entities/order.entity';
import {
  Body, Controller, Get, Param, Post, Req, Res, UsePipes, ValidationPipe
} from '@nestjs/common';
import { endPoint } from './order.endPoints';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderParamsDto } from './dto/update-order.dto';
import { join } from 'path';
import type { Request, Response } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Auth(endPoint.create)
  @Post('create')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UserDecorator() user: UserDocument
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ status: 201, data: { order } })
  }

  @Auth(endPoint.create)
  @Post('checkout/:orderId')
  async checkout(
    @Param() dto: OrderParamsDto,
    @UserDecorator() user: UserDocument
  ): Promise<IResponse> {
    const session = await this.orderService.checkout(dto.orderId, user);
    return successResponse({ status: 201, data: { session } })
  }
  // @Auth(endPoint.create)
  @Post('webhook')
  async webhook(
    @Req() req: Request,
  ): Promise<IResponse> {
    const session = await this.orderService.webhook(req);
    return successResponse({ status: 201, data: { session } })
  }

  // ------- these endpoints are for testing the success and cancel pages -----
  @Get('success')
  async success(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', '..', 'src', 'pages', 'success.page.html'));
  }
  @Get('cancel')
  async cancel(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', '..', 'src', 'pages', 'cancel.page.html'));
  }

}

