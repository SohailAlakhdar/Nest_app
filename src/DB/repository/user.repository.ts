
import { HUserDocument as TDocument } from './../models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from "@nestjs/common";
import { User } from '../models';
import { Model } from 'mongoose';



@Injectable()
export class UserRepository extends DatabaseRepository<TDocument> {
    constructor(
        @InjectModel(User.name) protected override readonly model:Model<TDocument>
    ){
        super(model)
    }
}
