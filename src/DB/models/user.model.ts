import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateHash } from 'src/commen';
import { GenderEnum, ProviderEnum } from 'src/commen/enums/user.enum';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
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
    set: function (this: HUserDocument, value: string) {
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
  provider: string;
  // --
  @Prop({
    type: String,
    required: function (this: HUserDocument) {
      // return this.provider == ProviderEnum.Google ? false : true;
      return (this.provider as ProviderEnum) !== ProviderEnum.Google;
    },
  })
  password: string;

  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.Male,
    required: true,
  })
  gender: string;

  @Prop({
    type: Date,
    required: false,
  })
  changeCredentialsTime: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

export type HUserDocument = HydratedDocument<User>;

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
