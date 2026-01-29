import { Brand, BrandDocument } from '../models/brand.model';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class BrandRepository extends DatabaseRepository<Brand> {
    constructor(
        @InjectModel(Brand.name) protected override readonly model: Model<BrandDocument>,
    ) {
        super(model);
    }
}
