

import { Types } from 'mongoose';
import { otpEnum } from 'src/commen/enums/otp.enum';
import { IUser } from './user.interface';

export interface IOtp {
    code: string;
    createdBy: Types.ObjectId | IUser;
    expiredAt: Date;
    type: otpEnum;

    createdAt?: Date;
    updatedAt?: Date;
}

// export interface IOtpDocument extends Document {
//   code: string;
//   createdBy: Types.ObjectId;
//   expiredAt: Date;
//   type: otpEnum;

//   createdAt?: Date;
//   updatedAt?: Date;

//   // used in middleware
//   plainOtp?: string;
//   wasNew?: boolean;
// }
