import { UserService } from './user.service';
import {
  BadRequestException,
  Controller,
  Get,
  ParseFilePipe,
  Patch,
  Req,
  SetMetadata,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { delay, of } from 'rxjs';
import { Auth } from 'src/commen/decorators/auth.decorator';
import { UserDecorator } from 'src/commen/decorators/user.decorator';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { tokenEnum } from 'src/commen/enums/token.enum';
import { RoleEnum } from 'src/commen/enums/user.enum';
import { LoggingInterceptor } from 'src/commen/interceptors/watchRequest.interceptors';
import { S3Service } from 'src/commen/services/s3.service';
import { cloudMulter } from 'src/commen/utils/multer/cloud.multer';
import { localMulter } from 'src/commen/utils/multer/local.multer';
import { fileValidation } from 'src/commen/utils/multer/valition.multer';
import type { UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/DB/models/user.model';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }
  // @UseInterceptors(LoggingInterceptor)
  @Auth([RoleEnum.User, RoleEnum.Admin], tokenEnum.refresh)
  @Get('/')
  profile(
    @UserDecorator() user: UserDocument,

  ) {
    return of([{ message: 'Done', data: user }])
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
  @UseInterceptors(FileInterceptor('profileImage',
    cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Patch("/profile-image")
  async profileImage(
    @UserDecorator() user: UserDocument,
    @UploadedFile(ParseFilePipe)
    profileImage: Express.Multer.File) {
    const url = await this.userService.profileImage(profileImage, user)
    console.log(profileImage);
    return { message: "Done", url }
  }

  @Auth([RoleEnum.User])
  @UseInterceptors(FilesInterceptor('coverImages', 3, cloudMulter({ storageApproch: storageEnum.disk, fileSizeMB: 2, validation: fileValidation.image })))
  @Patch("/cover-image")
  async coverImages(
    @UploadedFiles(
      ParseFilePipe
    ) coverImages: Array<Express.Multer.File>) {
    console.log(coverImages);
    return { message: "Done", coverImages }
  }
}
