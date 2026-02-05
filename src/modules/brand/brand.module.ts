import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { S3Service } from 'src/commen/services/s3.service';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { BrandModel } from 'src/DB/models/brand.model';

@Module({
  imports: [BrandModel, UserModel, TokenModel],
  controllers: [BrandController],
  providers: [BrandService, S3Service, BrandRepository, TokenService, UserRepository, TokenRepository],
})
export class BrandModule { }
