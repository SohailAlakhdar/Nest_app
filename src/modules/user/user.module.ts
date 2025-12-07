import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpModel, OtpRepository, UserModel, UserRepository } from 'src/DB';
import { TokenModel } from 'src/DB/models/token.model';
import { setDefaultLangauage } from 'src/commen';

@Module({
  imports: [UserModel, TokenModel, OtpModel],
  controllers: [UserController],
  providers: [UserService, UserRepository, OtpRepository, JwtService],
  exports: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(setDefaultLangauage).forRoutes('user');
  }
}
