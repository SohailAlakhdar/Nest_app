import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { tokenEnum } from '../enums/token.enum';
import { ICredentials } from '../interfaces/token.interface';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
   async use(req: ICredentials, res: Response, next: NextFunction) {
    console.log('Request...');
    console.log(req.headers.authorization);

    const { user, decoded } = await this.tokenService.decodedToken({
      authorization: req.headers.authorization ?? '',
      tokenType: tokenEnum.access,
    });
    next();
  }
}
