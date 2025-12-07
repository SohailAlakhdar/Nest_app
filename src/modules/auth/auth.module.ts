import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { OtpModel, OtpRepository, UserModel, UserRepository } from 'src/DB';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModel, OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, OtpRepository, JwtService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {
  constructor() {}
}
