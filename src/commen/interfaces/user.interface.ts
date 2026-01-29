import { OtpDocument } from "src/DB/models/otp.model";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enums/user.enum";

export interface IUser {
  // _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;        // virtual
  email: string;
  provider: ProviderEnum;
  password?: string;
  gender: GenderEnum;
  role: RoleEnum;
  changeCredentialsTime?: Date;
  confirmedAt?: Date;
  profilePicture?: string;
  otp?: OtpDocument[];      // virtual
  createdAt?: Date;
  updatedAt?: Date;
}


// import { Document } from 'mongoose';
// import { GenderEnum, ProviderEnum, RoleEnum } from 'src/commen/enums/user.enum';
// import { OtpDocument } from './otp.model';

// export interface IUserDocument extends Document {
//   firstName: string;
//   lastName: string;
//   username?: string;
//   email: string;
//   provider: ProviderEnum;
//   password?: string;
//   gender: GenderEnum;
//   role: RoleEnum;
//   changeCredentialsTime?: Date;
//   confirmedAt?: Date;
//   profilePicture?: string;
//   otp?: OtpDocument[];

//   createdAt?: Date;
//   updatedAt?: Date;
// }
