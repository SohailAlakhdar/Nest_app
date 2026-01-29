import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrnadModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/commen/services/s3.service';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { BrandExistsValidator } from 'src/commen/decorators/mongoDBIds.decorator';

@Module({
  imports: [BrnadModel, UserModel, TokenModel],
  controllers: [BrandController],
  providers: [BrandService, S3Service, BrandRepository, TokenService, UserRepository, TokenRepository],
})
export class BrandModule { }
