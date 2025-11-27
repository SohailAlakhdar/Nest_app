import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LoginBodyDto, SignupBodyDto } from './dto/signup.dto';
import { HUserDocument } from 'src/DB';
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  // SIGNUP
  @Post('signup')
  async signup(
    @Body( new ValidationPipe({stopAtFirstError:true})) body: SignupBodyDto,
  ) :Promise<{
      message:string,
      data:HUserDocument
    }>{
    const user  = await this.authService.signup(body)
    console.log({ body });
    return {
      message: "Done",
      data:user
    };
  }
  // LOGIN
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() body: LoginBodyDto,
  ) {
    return {
      message: 'User Login successfully!',
    };
  }
}

