import { UserRepository } from './../../DB/repository/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IUser } from 'src/commen/interfaces/user.interface';
import { SignupBodyDto } from './dto/signup.dto';
import { HUserDocument } from 'src/DB';
import { generateHash } from 'src/commen';
import { emailEvent } from 'src/commen/utils/email';

@Injectable()
export class AuthenticationService {
  users: IUser[] = [];
  constructor(private readonly userRepository: UserRepository) {}
  async signup(data: SignupBodyDto): Promise<HUserDocument> {
    const { username, email, password } = data;
    const checkUserExist = await this.userRepository.findOne({
      filter: {
        email,
      },
    });
    if (checkUserExist) {
      throw new ConflictException('User Already Exist!');
    }
    const [user] = await this.userRepository.create({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
        },
      ],
    });
    if (!user) {
      throw new BadRequestException('Error');
    }
    emailEvent.emit('ConfirmEmail', { to: email, otp: '6546321' });
    return user;
  }
}
