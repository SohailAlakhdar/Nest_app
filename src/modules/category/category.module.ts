import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { S3Service } from 'src/commen/services/s3.service';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { CategoryModel } from 'src/DB/models/category.model';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { BrandExistsValidator } from 'src/commen/decorators/mongoDBIds.decorator';
import { BrandModel } from 'src/DB/models/brand.model';

@Module({
  imports: [CategoryModel, UserModel, TokenModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, S3Service, CategoryRepository, TokenService, UserRepository, TokenRepository, BrandRepository, BrandExistsValidator],
})
export class CategoryModule { }
