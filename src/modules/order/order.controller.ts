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
import { CreateOrderDto } from './dto/create-Order.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Post('create')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument): Promise<IResponse<OrderResponse>> {
    const Order = await this.orderService.create(createOrderDto, user, file);
    return successResponse<OrderResponse>({ status: 201, data: { Order } })
  }

  // @Get()
  // async findAll(
  //   @Query() query: FindAllDto,
  // ): Promise<IResponse<FindAllResponse<IOrder>>> {
  //   const result = await this.orderService.findAll(query);
  //   return successResponse<FindAllResponse<IOrder>>({ data: { result } });
  // }

  // @Auth(endPoint.findAllArchives)
  // @Get('archive')
  // async findAllArchives(
  //   @Query() query: FindAllDto,
  // ): Promise<IResponse<FindAllResponse<IOrder>>> {
  //   const result = await this.orderService.findAll(query, true);
  //   return successResponse<FindAllResponse<IOrder>>({ data: { result } });
  // }

  // @Get(':orderId')
  // async findOne(
  //   @Param() param: OrderParamsDto): Promise<IResponse<OrderResponse>> {
  //   const Order = await this.orderService.findOne(param.orderId);
  //   return successResponse<OrderResponse>({ data: { Order } });
  // }
  // @Get(':orderId/archive')
  // async findOneArchive(
  //   @Param() param: OrderParamsDto): Promise<IResponse<OrderResponse>> {
  //   const Order = await this.orderService.findOne(param.orderId, true);
  //   return successResponse<OrderResponse>({ data: { Order } });
  // }

  // @Auth(endPoint.update)
  // @UseInterceptors(FileInterceptor('file',
  //   cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  // @Patch(':orderId/image')
  // async updateImage(
  //   @Param() param: OrderParamsDto,
  //   @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  //   @UserDecorator() user: UserDocument,
  // ): Promise<IResponse<OrderResponse>> {
  //   const Order = await this.orderService.updateImage(param.orderId, file, user);
  //   return successResponse<OrderResponse>({ data: { Order } })
  // }

  // @Auth(endPoint.update)
  // @Patch(':orderId')
  // async update(
  //   @Param() param: OrderParamsDto,
  //   @Body() updateOrderDto: UpdateOrderDto,
  //   @UserDecorator() user: UserDocument,
  // ): Promise<IResponse<OrderResponse>> {
  //   const Order = await this.orderService.update(param.orderId, updateOrderDto, user);
  //   return successResponse<OrderResponse>({ data: { Order } })
  // }


  // @Auth(endPoint.freeze)
  // @Delete(':orderId/freeze')
  // async freeze(
  //   @Param() param: OrderParamsDto,
  //   @UserDecorator() user: UserDocument): Promise<IResponse> {
  //   await this.orderService.freeze(param.orderId, user);
  //   return successResponse<OrderResponse>()
  // }

  // @Auth(endPoint.restore)
  // @Patch(':orderId/restore')
  // async restore(
  //   @Param() param: OrderParamsDto,
  //   @UserDecorator() user: UserDocument): Promise<IResponse<OrderResponse>> {
  //   const Order = await this.orderService.restore(param.orderId, user);
  //   return successResponse<OrderResponse>({ data: { Order } })
  // }

  // @Auth(endPoint.delete) // SuperAdmin
  // @Delete(':orderId/delete')
  // async remove(
  //   @Param() param: OrderParamsDto,
  //   @UserDecorator() user: UserDocument,
  // ) {
  //   await this.orderService.remove(param.orderId, user);
  //   return successResponse<OrderResponse>()
  // }
}



