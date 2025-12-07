import { TokenDocument as TDocument } from './../models/token.model';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { User } from '../models';
import { Model } from 'mongoose';
import { Token } from '../models/token.model';

@Injectable()
export class TokenRepository extends DatabaseRepository<Token> {
  constructor(
    @InjectModel(Token.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
