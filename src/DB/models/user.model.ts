import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/commen/enums/user.enum';
import { OtpDocument } from './otp.model';
import { generateHash } from 'src/commen/utils/security/hash.security';
import { IUser } from 'src/commen/interfaces/user.interface';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (this: UserDocument, value: string) {
      // value => username
      const [firstName, lastName] = value.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  username: string;
  // --
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;
  // --
  @Prop({
    type: String,
    enum: ProviderEnum,
    default: ProviderEnum.System,
    required: true,
  })
  provider: ProviderEnum;

  @Prop({
    type: String,
    required: function (this: UserDocument) {
      // return this.provider == ProviderEnum.Google ? false : true;
      return (this.provider as ProviderEnum) !== ProviderEnum.Google;
    },
  })
  password: string;
  // GENDER
  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.Male,
    required: true,
  })
  gender: GenderEnum;
  // ROLE
  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.User,
  })
  role: RoleEnum;

  @Prop({
    type: Date,
    required: false,
  })
  changeCredentialsTime: Date;

  @Prop({
    type: Date,
    required: false,
  })
  confirmedAt: Date;
  // ----

  @Virtual()
  otp: OtpDocument[];

  @Prop({
    type: String,
  })
  profilePicture: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  wishlist: Types.ObjectId[];
}
export type UserDocument = HydratedDocument<User>;

export const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual('otp', {
  ref: 'Otp',
  localField: '_id',
  foreignField: 'createdBy',
});

export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    useFactory: () => {
      // pre "save"  - mongoose middleware
      userSchema.pre('save', async function (next) {
        if (this.isModified('password')) {
          this.password = await generateHash(this.password);
        }
        next();
      });
      return userSchema;
    },
  },
]);
export const UserSchema = SchemaFactory.createForClass(User);

// Export schema definition for module, NOT the full MongooseModule
