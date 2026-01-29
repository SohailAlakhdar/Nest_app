import { TokenDocument as TDocument, } from './../models/token.model';
import { Token } from './../models/token.model';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class TokenRepository extends DatabaseRepository<Token, TDocument> {
  constructor(
    @InjectModel(Token.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
