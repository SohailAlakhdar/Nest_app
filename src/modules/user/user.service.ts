import { Get, Injectable } from '@nestjs/common';
import { storageEnum } from 'src/commen/enums/multer.enum';
import { S3Service } from 'src/commen/services/s3.service';
import { User } from 'src/DB/models/user.model';
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
  async profileImage() {

    // const key = await this.s3Service.uploadFile({
    //   path: `users/${userId}`,
    //   // file,
    // });

    // return { key };
  }
}
