import { OtpRepository } from './../../DB/repository/otp.repository';
import { UserRepository } from './../../DB/repository/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUser } from 'src/commen/interfaces/user.interface';
import { UserDocument, OtpDocument } from 'src/DB';
import {
  comparePassword,
  generateHash,
  generateOTP,
  otpEnum,
} from 'src/commen';
import { emailEvent } from 'src/commen/utils/email';
import {
  ConfirmEmailBodyDto,
  ResendConfirmEmailBodyDto,
  SignupBodyDto,
} from './dto/auth.dto';
import { Types } from 'mongoose';
import { getRemainingSeconds } from 'src/commen/utils/transformTime';

@Injectable()
export class AuthenticationService {
  users: IUser[] = [];
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) {}
  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    return await this.otpRepository.create({
      data: [
        {
          code: generateOTP(),
          createdBy: userId,
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          type: otpEnum.ConfirmEmail,
        },
      ],
    });
  }
  // SIGNUP
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
    await this.createConfirmEmailOtp(user._id);

    return user;
  }
  // RESEND_CONFIRM_EMAIL
  async resendConfirmEmail(data: ResendConfirmEmailBodyDto): Promise<string> {
    const { email } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        expiredAt: { $exists: false },
      },
      options: {
        populate: [{ path: 'otp', match: { type: otpEnum.ConfirmEmail } }],
      },
    });
    console.log(user);
    if (!user) {
      throw new NotFoundException('fail to find matching account');
    }

    if (user.otp.length) {
      throw new ConflictException(
        `Sorry you can send OTP after::${getRemainingSeconds(user.otp[0].expiredAt)} seconds`,
      );
    }
    await this.createConfirmEmailOtp(user._id);
    return 'Done';
  }
  async confirmEmail(data: ConfirmEmailBodyDto): Promise<string> {
    const { email, otp } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
        // options: {
        //   populate: [{ path: 'otp', match: { type: otpEnum.ConfirmEmail } }],
        // },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    console.log(user);

    const otpDocument = await this.otpRepository.findOne({
      filter: {
        createdBy: user._id,
        type: otpEnum.ConfirmEmail,
      },
      options: { new: true },
    });
    if (!otpDocument) {
      throw new NotFoundException('OTP not found or expired');
    }
    const isMatch = await comparePassword(otp, otpDocument?.code);
    if (!isMatch) throw new BadRequestException('Invalid OTP');
    otpDocument.expiredAt = new Date();
    await otpDocument.save();
    const result = await this.userRepository.updateOne({
      filter: { _id: user._id },
      update: { confirmedAt: new Date() },
    });

    return 'Done';
  }
}
