import { Type } from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserDocument } from 'src/DB/models/user.model';
import { tokenEnum } from '../enums/token.enum';
import { IUser } from './user.interface';

/**
 * --------------JwtPayload ------------------------
 * [key: string]: any;
This is an index signature.
It says: this object can have properties with any string key, and their values can be of any type.

iss stands for issuer (JWT standard claim). | Typical use: "iss": "https://your-auth-server.example".

sub stands for subject (the principal that is the subject of the JWT). |Often a user ID

aud is audience — who the token is intended for. | Can be a single string or an array of strings (JWT spec allows both).

exp is expiration time, expressed as a numeric timestamp (usually seconds since Unix epoch).

nbf stands for not before — the token must not be considered valid before this timestamp.

iat is issued at — timestamp when the token was issued.

jti is JWT ID — a unique identifier for the token.
 */


export interface IToken {
  jti: string;
  expiresIn: number;
  createdBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthJwtPayload extends JwtPayload {
  _id: Types.ObjectId;
  jti: string;
  iat: number;
}

export interface ICredentials {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest extends Request {
  credentials: ICredentials;
  tokenType?: tokenEnum;
}



// import { Document, Types } from 'mongoose';

// export interface ITokenDocument extends Document {
//   jti: string;
//   expiresIn: number;

//   userId?: Types.ObjectId; // virtual
//   createdAt?: Date;
//   updatedAt?: Date;
// }
