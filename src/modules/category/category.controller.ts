import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, UpdateCategoryDto } from './dto/update-category.dto';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { endPoint } from './category.endPoints';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import type { UserDocument } from 'src/DB/models/user.model';
import { IResponse } from 'src/commen/interfaces/response.interface';
import type { CategoryResponse } from './entities/category.entity';
import { successResponse } from 'src/commen/utils/response';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { ICategory } from 'src/commen/interfaces/category.interface';
import { FindAllResponse } from 'src/commen/entities/search.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Post('create')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(createCategoryDto, user, file);
    return successResponse<CategoryResponse>({ status: 201, data: { category } })
  }

  @Get()
  async findAll(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query);
    return successResponse<FindAllResponse<ICategory>>({ data: { result } });
  }

  @Auth(endPoint.findAllArchives)
  @Get('archive')
  async findAllArchives(
    @Query() query: FindAllDto,
  ): Promise<IResponse<FindAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query, true);
    return successResponse<FindAllResponse<ICategory>>({ data: { result } });
  }

  @Get(':categoryId')
  async findOne(
    @Param() param: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(param.categoryId);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  @Get(':categoryId/archive')
  async findOneArchive(
    @Param() param: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(param.categoryId, true);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endPoint.update)
  @UseInterceptors(FileInterceptor('file',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Patch(':categoryId/image')
  async updateImage(
    @Param() param: CategoryParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateImage(param.categoryId, file, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }

  @Auth(endPoint.update)
  @Patch(':categoryId')
  async update(
    @Param() param: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UserDecorator() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(param.categoryId, updateCategoryDto, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }


  @Auth(endPoint.freeze)
  @Delete(':categoryId/freeze')
  async freeze(
    @Param() param: CategoryParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse> {
    await this.categoryService.freeze(param.categoryId, user);
    return successResponse<CategoryResponse>()
  }

  @Auth(endPoint.restore)
  @Patch(':categoryId/restore')
  async restore(
    @Param() param: CategoryParamsDto,
    @UserDecorator() user: UserDocument): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(param.categoryId, user);
    return successResponse<CategoryResponse>({ data: { category } })
  }

  @Auth(endPoint.delete) // SuperAdmin
  @Delete(':categoryId/delete')
  async remove(
    @Param() param: CategoryParamsDto,
    @UserDecorator() user: UserDocument,
  ) {
    await this.categoryService.remove(param.categoryId, user);
    return successResponse<CategoryResponse>()
  }
}
