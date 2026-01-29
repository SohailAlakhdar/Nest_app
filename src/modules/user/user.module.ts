import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticationMiddleware } from 'src/commen/middleware/authentication.middleware';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationService } from '../auth/auth.service';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { OtpModel } from 'src/DB/models/otp.model';
import { S3Service } from 'src/commen/services/s3.service';

@Module({
  imports: [UserModel, TokenModel, OtpModel,
  ],
  controllers: [UserController],
  providers: [
    AuthenticationService,
    UserService,
    TokenService,
    UserRepository,
    OtpRepository,
    TokenRepository,
    JwtService,
    S3Service
  ], // providers is mean what services are used in this module
  exports: [], // exports is mean what services are used outside this module
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(UserController);
  }
}
