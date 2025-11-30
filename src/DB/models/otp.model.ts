import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { otpEnum } from 'src/commen';

@Schema({
  strictQuery: true,
  timestamps: true,
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
})
export class Otp {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, required: true })
  expiredAt: Date;

  @Prop({ type: String, enum: otpEnum, required: true })
  type: otpEnum;
}

export type OtpDocument = HydratedDocument<Otp>;

export const otpSchema = SchemaFactory.createForClass(Otp);
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = MongooseModule.forFeature([
  {
    name: Otp.name,
    schema: otpSchema,
  },
]);
