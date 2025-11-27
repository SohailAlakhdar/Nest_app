import { IUser } from 'src/commen/interfaces/user.interface';
import { UserService } from './user.service';
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
    constructor(private readonly userService:UserService){}
    @Get('/')
    allUser():{
      message: string,
      users:IUser[],
    } {
    const users =  this.userService.AllUsers()
    return {
      message: 'Done',
      users,
    };
  }
}
