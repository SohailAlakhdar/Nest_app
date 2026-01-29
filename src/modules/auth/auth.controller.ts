import {
  Body,
  Controller,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailBodyDto,
  LoginBodyDto,
  ResendConfirmEmailBodyDto,
  SignupBodyDto,
} from './dto/auth.dto';
import { UserDocument } from 'src/DB/models/user.model';
import { IResponse } from 'src/commen/interfaces/response.interface';
import { successResponse } from 'src/commen/utils/response';
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) { }

  // SIGNUP
  @Post('signup')
  async signup(
    @Body(new ValidationPipe({ stopAtFirstError: true })) body: SignupBodyDto,
  ): Promise<IResponse<UserDocument>> {
    const user = await this.authService.signup(body);
    return successResponse({ data: user });
  }
  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body(new ValidationPipe({ stopAtFirstError: true }))
    body: ResendConfirmEmailBodyDto,
  ): Promise<IResponse> {
    await this.authService.resendConfirmEmail(body);
    return successResponse();
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body(new ValidationPipe({ stopAtFirstError: true }))
    body: ConfirmEmailBodyDto,
  ): Promise<IResponse<UserDocument>> {
    const user: UserDocument = await this.authService.confirmEmail(body);
    return successResponse({ data: user });

  }

  // LOGIN
  @Post('login')
  async login(
    @Body(new ValidationPipe({ stopAtFirstError: true })) body: LoginBodyDto,
  ): Promise<IResponse> {
    const credentials = await this.authService.login(body);
    return successResponse({ data: credentials });
  }

}

