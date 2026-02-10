import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../models/coupon.model';

@Injectable()
export class CouponRepository extends DatabaseRepository<Coupon> {
    constructor(
        @InjectModel(Coupon.name) protected override readonly model: Model<CouponDocument>,
    ) {
        super(model);
    }
}
