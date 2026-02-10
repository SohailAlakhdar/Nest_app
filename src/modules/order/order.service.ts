import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/commen/services/s3.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserDocument } from 'src/DB/models/user.model';
import { Lean } from 'src/DB/repository/database.repository';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { FindAllDto } from 'src/commen/dtos/search.dto';
import { OrderDocument, OrderProduct } from 'src/DB/models/order.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductRepository } from 'src/DB/repository/product.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository) { }

  /**
   *
  Usually you calculate:
  subtotal
  discount
  tax
  shipping
  total price

    user: userId,
    products: cart.products,
    totalPrice,
    status: 'PENDING',
    paymentMethod

    1 check the cart and products has length
    2-
   */
  async create(dto: CreateOrderDto, user: UserDocument) {
    

    return "DONE";
  }
  // --------------------------------------
  async findAll(data: FindAllDto, archive: boolean = false)
    : Promise<{
      totalDocs: number | undefined;
      totalPages: number | undefined;
      page: number;
      size: number;
      docs: OrderDocument[] | Lean<OrderDocument>[];
    }> {
    const { page, size, search } = data
    const Orders = await this.orderRepository.paginate({
      filter: {
        ...(search ? {
          $or:
            [
              { name: { $regex: search, $options: 'i' } },
              { slug: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ]
        } : {}),
        ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
      options: {
        lean: true,
      },
      page,
      size,
    })
    return Orders;
  }
  // ----------------------------------------
  async findOne(OrderId, archive: boolean = false): Promise<OrderDocument | Lean<OrderDocument>> {
    const Order = await this.orderRepository.findOne({
      filter: {
        _id: OrderId, ...(archive ? {
          paranoid: false, freezedAt: { $exists: true }
        } : {})
      },
    })
    if (!Order) {
      throw new NotFoundException("Order not found")
    }
    return Order;
  }
  // -----------------------------------------
  // async updateImage(OrderId: Types.ObjectId, file: Express.Multer.File, user: UserDocument): Promise<OrderDocument | Lean<OrderDocument>> {
  //   const Order = await this.orderRepository.findOne({
  //     filter: { _id: OrderId },
  //   })
  //   if (!Order) throw new NotFoundException("Order not found");

  //   if (Order.image) await this.s3Service.deleteFile({ Key: Order.image });

  //   const image = await this.s3Service.uploadFile({
  //     storageApproach: storageEnum.disk,
  //     path: `${FolderPathEnum.Order}/${Order.assetFolderId}`,
  //     file,
  //   });
  //   const Order = await this.orderRepository.findOneAndUpdate({
  //     filter: { _id: OrderId },
  //     update: { image, updatedBy: user._id },
  //   })
  //   if (!Order) {
  //     await this.s3Service.deleteFile({ Key: image })
  //     throw new NotFoundException("Order not found")
  //   }
  //   // Order.image ? await this.s3Service.deleteFile({ Key: Order.image }) : true

  //   return Order;
  // }
  // -----------------------------------------

  // async update(OrderId: Types.ObjectId, updateOrderDto: UpdateOrderDto, user: UserDocument): Promise<OrderDocument | Lean<OrderDocument>> {
  //   if (updateOrderDto && await this.orderRepository.findOne({
  //     filter: {
  //       name: updateOrderDto.name,
  //       _id: { $ne: OrderId },
  //     }
  //   })) {
  //     throw new ConflictException('Order name already exists');
  //   }
  //   console.log({ updateOrderDto });

  //   const brands: Types.ObjectId[] = Array.from(
  //     new Set(updateOrderDto.brands || [])
  //   ).map(id => new Types.ObjectId(id));

  //   if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
  //     throw new NotFoundException("Brand Id is not found")
  //   }
  //   const Order = await this.orderRepository.findOneAndUpdate({
  //     filter: { _id: OrderId },
  //     update: [
  //       {
  //         $set: {
  //           brands: {
  //             $setUnion: [
  //               {
  //                 $setDifference: [
  //                   { $setUnion: ['$brands', []] },
  //                   (updateOrderDto.removedBrands ?? []).map(
  //                     id => new Types.ObjectId(id),
  //                   ),
  //                 ],
  //               },
  //               (updateOrderDto.brands ?? []).map(
  //                 id => new Types.ObjectId(id),
  //               ),
  //             ],
  //           },
  //           ...(updateOrderDto.name && { name: updateOrderDto.name }),
  //           ...(updateOrderDto.description && { description: updateOrderDto.description }),
  //           updatedBy: user._id,
  //         },
  //       }
  //     ],
  //   });
  //   if (!Order) {
  //     throw new NotFoundException("Order not found")
  //   }
  //   return Order;
  // }
  // // -----------------------------------------

  // async freeze(OrderId: Types.ObjectId, user: UserDocument) {
  //   const Order = await this.orderRepository.findOneAndUpdate({
  //     filter: { _id: OrderId, freezedAt: { $exists: false } },
  //     update: { freezedAt: new Date(), $unset: { restoredAt: true }, updatedBy: user._id }
  //   })
  //   if (!Order) {
  //     throw new NotFoundException("Order not found")
  //   }
  //   return "Done";
  // }
  // // -----------------------------------------

  // async restore(OrderId: Types.ObjectId, user: UserDocument): Promise<OrderDocument | Lean<OrderDocument>> {
  //   const Order = await this.orderRepository.findOneAndUpdate({
  //     filter: {
  //       _id: OrderId,
  //       paranoid: false,
  //       freezedAt: { $exists: true },
  //       restoredAt: { $exists: false },
  //     },
  //     update: {
  //       $unset: { freezedAt: true },
  //       $set: {
  //         restoredAt: new Date(),
  //         updatedBy: user._id,
  //       },
  //     },
  //   })
  //   console.log("Re");

  //   if (!Order) {
  //     throw new NotFoundException("Order not found")
  //   }
  //   return Order;
  // }
  // // -----------------------------------------

  // async remove(OrderId: Types.ObjectId, user: UserDocument) {
  //   const Order = await this.orderRepository.findOneAndDelete({
  //     filter: { _id: OrderId, pranoid: false, freezedAt: { $exists: false } },
  //   })

  //   if (!Order) {
  //     throw new NotFoundException("Order not found")
  //   }
  //   await this.s3Service.deleteFile({ Key: Order.image as string })
  //   return "Done";
  // }
  // -----------------------------------------

}
