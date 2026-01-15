import { Get, Injectable } from '@nestjs/common';
import { User } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  async AllUsers(): Promise<User[]> {
    const users = (await this.userRepository.find({})) || [];
    return users;
  }
  // : Promise<UserDocument>
  @Get()
  async profile(userId) {
    const user = await this.userRepository.findOne({
      filter: { _id: userId },
    });

    return user;
  }
}
