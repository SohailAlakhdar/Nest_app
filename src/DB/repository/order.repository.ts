import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Order, type OrderDocument } from '../models/order.model';

@Injectable()
export class OrderRepository extends DatabaseRepository<Order> {
    constructor(
        @InjectModel(Order.name) protected override readonly model: Model<OrderDocument>,
    ) {
        super(model);
    }
}
