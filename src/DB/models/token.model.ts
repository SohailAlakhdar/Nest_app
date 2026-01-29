import {
  MongooseModule,
  Prop,
  SchemaFactory,
  Virtual,
  Schema,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IToken } from 'src/commen/interfaces/token.interface';
import { IUser } from 'src/commen/interfaces/user.interface';
/**
 * jti => JSON Web Token (JWT) ID
 */

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Token implements IToken {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  jti: string;

  // lifetime in seconds
  @Prop({
    type: Number,
    required: true,
  })
  expiresIn: number;


  @Virtual()
  createdBy: Types.ObjectId | IUser;
}

// TokenSchema
export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// VIRTUAL
TokenSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export type TokenDocument = HydratedDocument<IToken>;

// MODEL
export const TokenModel = MongooseModule.forFeatureAsync([
  {
    name: Token.name,
    useFactory: () => {
      //   TokenSchema.pre('save', function (next) {
      //     next();
      //   });
      return TokenSchema;
    },
  },
]);
