import { Get, Injectable } from '@nestjs/common';
import { User, UserDocument, UserRepository } from 'src/DB';

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
