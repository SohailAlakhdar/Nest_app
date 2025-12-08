import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpModel, OtpRepository, UserModel, UserRepository } from 'src/DB';
import { TokenModel } from 'src/DB/models/token.model';
import { AuthenticationMiddleware } from 'src/commen';
import { TokenService } from 'src/commen/services/token.service';

@Module({
  imports: [UserModel, TokenModel, OtpModel],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    OtpRepository,
    JwtService,
    TokenService,
  ],
  exports: [UserService, TokenService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(UserController);
  }
}
