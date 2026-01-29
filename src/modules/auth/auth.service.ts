import { OtpRepository } from './../../DB/repository/otp.repository';
import { UserRepository } from './../../DB/repository/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUser } from 'src/commen/interfaces/user.interface';
import {
  ConfirmEmailBodyDto,
  LoginBodyDto,
  ResendConfirmEmailBodyDto,
  SignupBodyDto,
} from './dto/auth.dto';
import { Types } from 'mongoose';
import { getRemainingSeconds } from 'src/commen/utils/transformTime';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/DB/models/user.model';
import { otpEnum } from 'src/commen/enums/otp.enum';
import { ProviderEnum } from 'src/commen/enums/user.enum';
import { comparePassword, generateHash } from 'src/commen/utils/security/hash.security';
import { generateOTP } from 'src/commen/utils/otp';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService,
  ) { }

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
  async confirmEmail(data: ConfirmEmailBodyDto): Promise<UserDocument> {
    const { email, code } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
      },
      options: {
        populate: [{ path: 'otp', match: { type: otpEnum.ConfirmEmail } }],
      },
    });
    if (!user)
      throw new NotFoundException('User not found or already confirmed');
    console.log(user);

    if (!user.otp || user.otp.length === 0) {
      throw new BadRequestException('OTP not found');
    }

    // const otpDoc = user.otp[0];
    const isMatch = await comparePassword(code, user.otp[0].code);

    if (!isMatch) {
      throw new BadRequestException('Invalid OTP');
    }
    user.confirmedAt = new Date();
    await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } });
    await user.save();

    return user as UserDocument;
  }
  // LOGIN
  async login(
    data: LoginBodyDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider: ProviderEnum.System,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (await comparePassword(password, user.password)) {
      throw new BadRequestException('Invalid Password');
    }
    const credentials = {
      access_token: await this.jwtService.signAsync(
        { sub: user._id },
        {
          secret: process.env.ACCESS_USER_TOKEN_SIGNATURE || 'dsdsddddssd',
          expiresIn: 60 * 60 * 24,
        },
      ),
      refresh_token: await this.jwtService.signAsync(
        { sub: user._id },
        {
          secret: process.env.REFRESH_USER_TOKEN_SIGNATURE || 'dsdsddddssd',
          expiresIn: '1y',
        },
      ),
    };

    return credentials;
  }
}
