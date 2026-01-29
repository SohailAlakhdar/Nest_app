import { Category, CategoryDocument } from '../models/category.model';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends DatabaseRepository<Category> {
    constructor(
        @InjectModel(Category.name) protected override readonly model: Model<CategoryDocument>,
    ) {
        super(model);
    }
}
