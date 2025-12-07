import { Types } from "mongoose";

export interface IToken {
  jti: string;
  expiresIn: number;
  userId: Types.ObjectId;
}