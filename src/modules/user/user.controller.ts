import { UserService } from './user.service';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User, UserDocument } from 'src/DB';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/')
  profile(
    @Req()
    req: Request & {
      credentials: { user: UserDocument; decoded: JwtPayload };
    },
  ) {
    console.log({
      lang: req.headers['accept-language'],
      credentials: req.credentials,
    });

    return {
      message: 'Done',
    };
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
      lang: req.headers['accepet-language'],
      credentials: req.credentials,
    });

    return {
      message: 'Done',
      users,
    };
  }
}
