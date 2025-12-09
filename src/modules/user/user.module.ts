import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpModel, OtpRepository, TokenModel, UserModel, UserRepository } from 'src/DB';
import { AuthenticationMiddleware, TokenService } from 'src/commen';

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
