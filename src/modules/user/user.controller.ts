import { UserService } from './user.service';
import { Controller, Get } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User, UserDocument } from 'src/DB';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/')
  profile(
    req: Request & {
      credentials: { user: UserDocument; decoded: JwtPayload };
    },
  ) {
    // const user = await this.userService.profle(userId);
    console.log({
      // lang: req.headers['Accept-Language'],
      // credentials: req.credentials,
    });
    console.log(req);
    

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
