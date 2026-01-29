import { Get, Injectable } from '@nestjs/common';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { S3Service } from 'src/commen/services/s3.service';
import { User } from 'src/DB/models/user.model';
import type { UserDocument } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly s3Service: S3Service
  ) { }

  @Get()
  async AllUsers(): Promise<User[]> {
    const users = (await this.userRepository.find({})) || [];
    return users;
  }
  // : Promise<UserDocument>
  @Get()
  async profile(userId) {
    const user = await this.userRepository.findOne({
      filter: { _id: userId },
    });

    return user;
  }

  @Get()
  async profileImage(file: Express.Multer.File, user: UserDocument) {
    user.profilePicture = await this.s3Service.uploadFile({
      file,
      storageApproach: storageEnum.disk,
      path: `user/${user._id}`
    })
    user.save()
    return user.profilePicture

  }
}
