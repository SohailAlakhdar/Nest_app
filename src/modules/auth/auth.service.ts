import { OtpRepository } from './../../DB/repository/otp.repository';
import { UserRepository } from './../../DB/repository/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IUser } from 'src/commen/interfaces/user.interface';
import { UserDocument } from 'src/DB';
import { generateHash, otpEnum } from 'src/commen';
import { emailEvent } from 'src/commen/utils/email';
import { SignupBodyDto } from './dto/auth.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthenticationService {
  users: IUser[] = [];
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) {}
  async signup(data: SignupBodyDto): Promise<UserDocument> {
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
    const [otp] = await this.otpRepository.create({
      data: [
        {
          code: '89999',
          createdBy: user._id,
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          type: otpEnum.ConfirmEmail,
        },
      ],
    });

    return user;
  }
}
