import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponParamsDto, UpdateCouponDto } from './dto/update-coupon.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { successResponse } from 'src/commen/utils/response';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { endPoint } from './coupon.endPoints';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import { type UserDocument } from 'src/DB/models/user.model';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { FindAllResponse } from 'src/commen/entities/search.entity';
import { ICoupon } from 'src/commen/interfaces/coupon.interface';
import { CouponResponse } from './entities/coupon.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @Auth(endPoint.create)
  @Post('create')
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  async create(
    @UserDecorator() user: UserDocument,
    @Body() createCouponDto: CreateCouponDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const coupon = await this.couponService.create(createCouponDto, file, user);
    return successResponse({ data: { coupon } })
  }
  @Auth(endPoint.findAll)
  @Get()
  async findAll(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query);
    return successResponse<FindAllResponse<ICoupon>>({ data: { result } });
  }

  @Auth(endPoint.findAllArchives)
  @Get('archive')
  async findAllArchives(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query, true);
    return successResponse<FindAllResponse<ICoupon>>({ data: { result } });
  }

  @Get(':couponId')
  async findOne(
    @Param() param: CouponParamsDto): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(param.couponId);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  @Get(':couponId/archive')
  async findOneArchive(
    @Param() param: CouponParamsDto): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(param.couponId, true);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  @Auth(endPoint.update)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Patch(':couponId/image')
  async updateImage(
    @Param() param: CouponParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.updateImage(param.couponId, file, user);
    return successResponse<CouponResponse>({ data: { coupon } })
  }


  @Auth(endPoint.update)
  @Patch(':couponId')
  async update(
    @Param() param: CouponParamsDto,
    @Body() updatecouponDto: UpdateCouponDto,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.update(param.couponId, updatecouponDto, user);
    return successResponse<CouponResponse>({ data: { coupon } })
  }


  @Auth(endPoint.freeze)
  @Delete(':couponId/freeze')
  async freeze(
    @Param() param: CouponParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse> {
    await this.couponService.freeze(param.couponId, user);
    return successResponse<CouponResponse>()
  }

  @Auth(endPoint.restore)
  @Patch(':couponId/restore')
  async restore(
    @Param() param: CouponParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.restore(param.couponId, user);
    return successResponse<CouponResponse>({ data: { coupon } })
  }

  @Auth(endPoint.delete) // SuperAdmin
  @Delete(':couponId/delete')
  async remove(
    @Param() param: CouponParamsDto,
    @UserDecorator() user: UserDocument,
  ) {
    await this.couponService.remove(param.couponId, user);
    return successResponse<CouponResponse>()
  }
}
