import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (!(req.headers.authorization?.split(' ').length == 2)) {
      throw new BadRequestException('Missing authorization key');
    }
    next();
  }
}
