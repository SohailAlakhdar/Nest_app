import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UsePipes,
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
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  // SIGNUP
  @Post('signup')
  async signup(
    @Body(new ValidationPipe({ stopAtFirstError: true })) body: SignupBodyDto,
  ): Promise<{
    message: string;
    data: UserDocument;
  }> {
    const user = await this.authService.signup(body);
    return {
      message: 'Done',
      data: user,
    };
  }
  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body(new ValidationPipe({ stopAtFirstError: true }))
    body: ResendConfirmEmailBodyDto,
  ): Promise<{
    message: string;
  }> {
    await this.authService.resendConfirmEmail(body);
    return {
      message: 'Done',
    };
  }
  @Patch('confirm-email')
  async confirmEmail(
    @Body(new ValidationPipe({ stopAtFirstError: true }))
    body: ConfirmEmailBodyDto,
  ): Promise<{
    message: string;
    data: UserDocument;
  }> {
    const user: UserDocument = await this.authService.confirmEmail(body);
    return {
      message: 'Done',
      data: user,
    };
  }

  // LOGIN
  @Post('login')
  async login(
    @Body(new ValidationPipe({ stopAtFirstError: true })) body: LoginBodyDto,
  ): Promise<{
    message: string;
    data: { credentials: { access_token; refresh_token } };
  }> {
    const credentials = await this.authService.login(body);
    return {
      message: 'Done',
      data: { credentials },
    };
  }
}

