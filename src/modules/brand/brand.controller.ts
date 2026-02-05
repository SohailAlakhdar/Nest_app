import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ValidationPipe, UsePipes, ParseFilePipe, Search } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrnadParamsDto,  UpdateBrandDto } from './dto/update-brand.dto';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { endPoint } from './brand.endPoints';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import type { UserDocument } from 'src/DB/models/user.model';
import { successResponse } from 'src/commen/utils/response';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { BrandResponse} from './entities/brand.entity';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { IBrand } from 'src/commen/interfaces/brand.interface';
import { FindAllResponse } from 'src/commen/entities/search.entity';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Post('create')
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, user, file);
    return successResponse<BrandResponse>({ status: 201, data: { brand } })
  }

  @Get()
  async findAll(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse<FindAllResponse<IBrand>>({ data: { result } });
  }

  @Auth(endPoint.findAllArchives)
  @Get('archive')
  async findAllArchives(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query, true);
    return successResponse<FindAllResponse<IBrand>>({ data: { result } });
  }

  @Get(':brandId')
  async findOne(
    @Param() param: BrnadParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(param);
    return successResponse<BrandResponse>({ data: { brand } });
  }
  @Get(':brandId/archive')
  async findOneArchive(
    @Param() param: BrnadParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(param, true);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  @Auth(endPoint.update)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Patch(':brandId/image')
  async updateImage(
    @Param() param: BrnadParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateImage(param.brandId, file, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }

  @Auth(endPoint.update)
  @Patch(':brandId')
  async update(
    @Param() param: BrnadParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(param.brandId, updateBrandDto, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @Auth(endPoint.freeze)
  @Delete(':brandId/freeze')
  async freeze(
    @Param() param: BrnadParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse> {
    await this.brandService.freeze(param.brandId, user);
    return successResponse<BrandResponse>()
  }

  @Auth(endPoint.restore)
  @Patch(':brandId/restore')
  async restore(
    @Param() param: BrnadParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.restore(param.brandId, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }

  @Auth(endPoint.delete) // SuperAdmin
  @Delete(':brandId/delete')
  async remove(
    @Param() param: BrnadParamsDto,
    @UserDecorator() user: UserDocument,
  ) {
    await this.brandService.remove(param.brandId, user);
    return successResponse<BrandResponse>()
  }
}
