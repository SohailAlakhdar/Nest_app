// import { Global, Module } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UserRepository } from 'src/DB/repository/user.repository';
// import { UserModel } from 'src/DB/models/user.model';
// import { TokenModel } from 'src/DB/models/token.model';
// import { TokenRepository } from 'src/DB/repository/token.repository';
// import { UserController } from 'src/modules/user/user.controller';
// import { UserService } from 'src/modules/user/user.service';
// import { TokenService } from '../services/token.service';
// @Global()
// @Module({
//   imports: [UserModel, TokenModel],
//   controllers: [UserController],
//   providers: [
//     UserRepository,
//     TokenRepository,
//     JwtService,
//     TokenService,
//     UserService,
//   ],
//   exports: [
//     UserRepository,
//     TokenRepository,
//     UserModel,
//     TokenModel,
//     JwtService,
//     TokenService,
//     UserService,
//   ],
// })
// export class SharedModule {
//   constructor() {}
// }
