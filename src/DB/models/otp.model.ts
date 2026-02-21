/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { otpEnum } from 'src/commen/enums/otp.enum';
import { IOtp } from 'src/commen/interfaces/otp.interface';
import { emailEvent } from 'src/commen/utils/email/email.event';
import { generateHash } from 'src/commen/utils/security/hash.security';

@Schema({
  strictQuery: true,
  timestamps: true,
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
})
export class Otp implements IOtp {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: new Date(Date.now() + 2 * 60 * 1000) }) // 2 min = default
  expiredAt: Date;

  @Prop({ type: String, enum: otpEnum, required: true })
  type: otpEnum;
}

export type OtpDocument = HydratedDocument<Otp>;

export const otpSchema = SchemaFactory.createForClass(Otp);
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

// Otp hooks
otpSchema.pre(
  'save',
  async function (
    this: OtpDocument & { wasNew: boolean; plainOtp?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified('code')) {
      this.plainOtp = this.code;
      this.code = await generateHash(this.code);
      await this.populate([{ path: 'createdBy', select: 'email' }]);
    }
    next();
  },
);
otpSchema.post(
  'save',
  function (
    this: OtpDocument & { wasNew: boolean; plainOtp?: string },
    doc,
    next,
  ) {
    // const that = this as OtpDocument & { wasNew: boolean; plainOtp?: string };
    if (this.wasNew && this.plainOtp) {
      emailEvent.emit(doc.type, {
        to: (this.createdBy as any).email,
        otp: this.plainOtp,
      });
    }
    next();
  },
);

export const OtpModel = MongooseModule.forFeature([
  {
    name: Otp.name,
    schema: otpSchema,
  },
]);
