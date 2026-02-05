import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductModel } from 'src/DB/models/product.model';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { S3Service } from 'src/commen/services/s3.service';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { BrandModel } from 'src/DB/models/brand.model';
import { CategoryModel } from 'src/DB/models/category.model';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';

@Module({
  imports: [ProductModel, UserModel, TokenModel, BrandModel, CategoryModel],
  controllers: [ProductController],
  providers: [ProductService, S3Service, ProductRepository, BrandRepository, CategoryRepository, TokenService, UserRepository, TokenRepository],
})
export class ProductModule { }
