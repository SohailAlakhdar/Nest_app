import { Get, Injectable } from '@nestjs/common';
import { IUser } from 'src/commen/interfaces/user.interface';

@Injectable()
export class UserService {
  constructor() {}

  @Get()
  AllUsers(): IUser[] {
    return [{ id: 2, username: 'sohail', email: 'sohail@', password: '55' }];
  }
}
