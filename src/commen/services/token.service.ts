/* eslint-disable @typescript-eslint/require-await */
import { v4 as uuid } from 'uuid';
import { sign, verify } from 'jsonwebtoken';
import type {
  JwtPayload,
  Secret,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';
import { RoleEnum } from 'src/commen/enums';
import { signatureLevelEnum, tokenEnum } from 'src/commen/enums/token.enum';
import { UserDocument, UserRepository } from 'src/DB';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenModel } from 'src/DB/models/token.model';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { UserModule } from 'src/modules/user/user.module';
import { Types } from 'mongoose';
import { IAuthJwtPayload } from '../interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}
  generateToken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
  }: {
    payload: object;
    secret?: Secret;
    options?: SignOptions;
  }): Promise<string> => {
    return sign(payload, secret, options);
  };
  verifyToken = async ({
    token,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options,
  }: {
    token: string;
    secret?: Secret;
    options?: VerifyOptions;
  }): Promise<JwtPayload> => {
    return verify(token, secret, options) as JwtPayload;
  };

  //  Bearer or System => User or Admin or SuperAdmin
  detectSignatureLevel = async (
    role: RoleEnum = RoleEnum.User,
  ): Promise<signatureLevelEnum> => {
    let signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer;
    switch (role) {
      case RoleEnum.Admin:
      case RoleEnum.SuperAdmin:
        signatureLevel = signatureLevelEnum.System;
        break;
      default:
        signatureLevel = signatureLevelEnum.Bearer;
        break;
    }
    return signatureLevel;
  };
  // input Bearer or System
  // to know the secret of access_token and refresh_token signatures
  getSignature = async (
    signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> => {
    const signatures: { access_token: string; refresh_token: string } = {
      access_token: '',
      refresh_token: '',
    };
    switch (signatureLevel) {
      case signatureLevelEnum.System:
        signatures.access_token = process.env
          .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
        signatures.refresh_token = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
        break;
      default:
        signatures.access_token = process.env
          .ACCESS_USER_TOKEN_SIGNATURE as string;
        signatures.refresh_token = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string;
        break;
    }
    return signatures;
    // return {
    //     access_token,
    //     refresh_token,
    // };
  };
  //   generate access_token and refresh_token
  createLoginCredentials = async (user: UserDocument) => {
    const signatureLevel = await this.detectSignatureLevel(user.role);
    const signatuers = await this.getSignature(signatureLevel);
    const jwtid: string = uuid();
    const access_token = await this.generateToken({
      payload: { _id: user._id },
      secret: signatuers.access_token,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        jwtid,
      },
    });
    const refresh_token = await this.generateToken({
      payload: { _id: user._id },

      secret: signatuers.refresh_token,
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        jwtid,
      },
    });
    return {
      access_token,
      refresh_token,
    };
  };

  // output => decoded and user
  decodedToken = async ({
    authorization,
    tokenType = tokenEnum.access,
  }: {
    authorization: string;
    tokenType?: tokenEnum;
  }) => {
    const [BearerKey, token] = authorization.split(' ');
    if (!BearerKey || !token) {
      throw new UnauthorizedException('Missing token parts');
    }
    const signatures = await this.getSignature(BearerKey as signatureLevelEnum);
    const decoded = await this.verifyToken({
      token: token,
      secret:
        tokenType === tokenEnum.refresh
          ? signatures.refresh_token
          : signatures.access_token,
    });
    console.log({ decoded });
    if (!decoded.iat || !decoded.sub) {
      throw new BadRequestException('invalid Token payload');
    }
    if (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } })) {
      throw new UnauthorizedException('In-valid or old login credentials');
    }
    const user = await this.tokenRepository.findOne({
      filter: { _id: decoded.sub },
    });
    console.log({ user });
    if (!user) {
      throw new BadRequestException('Not Rigister Account');
    }
    if ((user.changeCredentialsAt?.getTime() || 0) > decoded.iat * 1000) {
      throw new UnauthorizedException('Invalid or old login credentials');
    }
    return { user, decoded };
  };

  createRevokeToken = async (decoded: IAuthJwtPayload) => {
    const [result] =
      (await this.tokenRepository.create({
        data: [
          {
            jti: decoded?.jti,
            expiresIn:
              decoded?.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            userId: decoded?._id,
            // userId: decoded?._id as Types.ObjectId,
          },
        ],
      })) || [];
    if (!result) {
      throw new BadRequestException('Failed to create revoke token');
    }
    return result;
  };
}
