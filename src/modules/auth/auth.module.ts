import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { OtpModel, OtpRepository, UserModel, UserRepository } from 'src/DB';

@Module({
  imports: [UserModel, OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, OtpRepository],
  exports: [AuthenticationService],
})
export class AuthenticationModule {
  constructor() {}
}
