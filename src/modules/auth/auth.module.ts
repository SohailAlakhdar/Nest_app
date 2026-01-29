import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { Otp, OtpModel } from 'src/DB/models/otp.model';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { UserModel } from 'src/DB/models/user.model';
import { TokenModel } from 'src/DB/models/token.model';
import { UserService } from '../user/user.service';
import { TokenService } from 'src/commen/services/token.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/commen/services/s3.service';

@Module({
  imports: [UserModel, TokenModel, OtpModel],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    OtpRepository,
    UserService,
    TokenService,
    UserRepository,
    TokenRepository,
    JwtService,
    S3Service
  ],
  exports: [],
})
export class AuthenticationModule {
  constructor() {}
}
