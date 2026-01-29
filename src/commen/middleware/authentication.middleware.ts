import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor() { }
  use(req: Request, res: Response, next: NextFunction) {
    if (!(req.headers.authorization?.split(' ').length == 2)) {
      throw new BadRequestException('Missing authorization key');
    }
    next();
  }
}
