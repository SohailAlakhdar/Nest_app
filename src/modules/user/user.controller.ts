import { UserService } from './user.service';
import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Req,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { delay, of } from 'rxjs';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import { tokenEnum } from 'src/commen/enums/token.enum';
import { RoleEnum } from 'src/commen/enums/user.enum';
import { LoggingInterceptor } from 'src/commen/interceptors/watchRequest.interceptors';
import { localMulter } from 'src/commen/utils/multer/local.multer';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import type { UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/DB/models/user.model';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) { }
  // @UseInterceptors(LoggingInterceptor)
  @Auth([RoleEnum.User, RoleEnum.Admin], tokenEnum.refresh)
  @Get('/')
  profile(
    @UserDecorator() user: UserDocument,
    // @Req()
    // req: IAuthRequest,
  ) {
    return of([{ message: 'Done', data: user }]).pipe(delay(10000));
    // console.log({ user });

    // return {
    //   message: 'Done',
    //   data: user,
    // };
  }

  @Get('/users')
  async allUser(
    req: Request & { credentials: { user: UserDocument; decoded: JwtPayload } },
  ): Promise<{
    message: string;
    users: User[];
  }> {
    const users = await this.userService.AllUsers();
    console.log({
      lang: req.headers['accept-language'],
      credentials: req.credentials,
    });

    return {
      message: 'Done',
      users,
    };
  }

  @Auth([RoleEnum.User])
  @UseInterceptors(FileInterceptor('profileImage', localMulter({ folder: "users", fileSizeMB: 5, validation: fileValidation.image })))
  @Patch("/profile-image")
  async profileImage(@UploadedFile() profileImage: Express.Multer.File) {
    if (!profileImage) {
      throw new BadRequestException('No file provided');
    }
    console.log(profileImage);
    return { message: "Done", profileImage }
  }
}
