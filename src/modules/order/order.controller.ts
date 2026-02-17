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
import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { endPoint } from './order.endPoints';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Auth(endPoint.create)
  @Post('create')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UserDecorator() user: UserDocument
  ): Promise<IResponse> {
    const order = await this.orderService.create(createOrderDto, user);
    // return successResponse<OrderResponse>({ status: 201, data: { order } })
    return successResponse({ status: 201, data: { order } })
  }

}



