import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ValidationPipe, UsePipes, ParseFilePipe, Search, UploadedFiles } from '@nestjs/common';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import type { UserDocument } from 'src/DB/models/user.model';
import { successResponse } from 'src/commen/utils/response';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponse } from './entities/product.entity';
import { endPoint } from './product.endPoints';
import { ProductParamsDto, UpdateProductDto, UpdateProductImageDto } from './dto/update-product.dto';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { IProduct } from 'src/commen/interfaces/product.interface';
import { FindAllResponse } from 'src/commen/entities/search.entity';
import { Types } from 'mongoose';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('/product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Auth(endPoint.create)
  @UseInterceptors(
    FilesInterceptor('files', 5,
      cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })
    )

    // FileInterceptor('files',
    // cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image }))
  )
  @Post('create')
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @UserDecorator() user: UserDocument): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(createProductDto, user, files);
    return successResponse<ProductResponse>({ status: 201, data: { product } })
  }

  @Get()
  async findAll(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query);
    return successResponse<FindAllResponse<IProduct>>({ data: { result } });
  }

  @Auth(endPoint.findAllArchives)
  @Get('archive')
  async findAllArchives(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, true);
    return successResponse<FindAllResponse<IProduct>>({ data: { result } });
  }

  @Get(':productId')
  async findOne(
    @Param() param: ProductParamsDto): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(param.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }
  // -------------------------------------------------------------
  @Get(':productId/archive')
  async findOneArchive(
    @Param() param: ProductParamsDto): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(param.productId, true);
    return successResponse<ProductResponse>({ data: { product } });
  }
  // -------------------------------------------------------------

  @Auth(endPoint.update)
  @UseInterceptors(
    FilesInterceptor('files', 5,
      cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })
    )
  )
  @Patch(':productId/image')
  async updateImage(
    @Param() param: ProductParamsDto,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false })) files: Express.Multer.File[],
    @UserDecorator() user: UserDocument,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateImage(updateProductImageDto, param.productId, files, user);
    return successResponse<ProductResponse>({ data: { product } })
  }
  // -------------------------------------------------------------
  @Auth(endPoint.update)
  @Patch(':productId')
  async update(
    @Param() param: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(param.productId, updateProductDto, user);
    return successResponse<ProductResponse>({ data: { product } })
  }


  @Auth(endPoint.freeze)
  @Delete(':productId/freeze')
  async freeze(
    @Param() param: ProductParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse> {
    await this.productService.freeze(param.productId, user);
    return successResponse<ProductResponse>()
  }

  @Auth(endPoint.restore)
  @Patch(':productId/restore')
  async restore(
    @Param() param: ProductParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.restore(param.productId, user);
    return successResponse<ProductResponse>({ data: { product } })
  }

  @Auth(endPoint.delete) // SuperAdmin
  @Delete(':productId/delete')
  async remove(
    @Param() param: ProductParamsDto,
    @UserDecorator() user: UserDocument,
  ) {
    await this.productService.remove(param.productId, user);
    return successResponse<ProductResponse>()
  }

  // --------------------wishlist
  @Auth(endPoint.freeze)
  @Post(':productId/add-to-wishlist')
  async addToWishlist(
    @UserDecorator() user: UserDocument,
    @Param('productId') productId: Types.ObjectId) {
    const result = await this.productService.addToWishlist(user._id, productId);
    return successResponse({ data: { result } })

  }
  @Auth(endPoint.freeze)
  @Delete(':productId/remove-from-wishlist')
  async removeFromWishlist(
    @UserDecorator() user: UserDocument,
    @Param('productId') productId: Types.ObjectId) {
    const result = await this.productService.removeFromWishlist(user._id, productId);
    return successResponse({ data: { result } })

  }

}
