import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tokenName } from 'src/commen/decorators/tokenType.decorator';
import { tokenEnum } from 'src/commen/enums/token.enum';
import { TokenService } from 'src/commen/services/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) || tokenEnum.access;

    let ctx: any;
    let authorization: string;
    let req: any;
    switch (context.getType()) {
      case 'http':
        ctx = context.switchToHttp();
        req = ctx.getRequest();
        authorization = req.headers['authorization'] ?? '';
        break;
      case 'rpc':
        ctx = context.switchToRpc();
        break;
      case 'ws':
        ctx = context.switchToWs();
        break;

      default:
        throw new UnauthorizedException('Unsupported context type');
    }

    const { user, decoded } = await this.tokenService.decodedToken({
      authorization: req.headers.authorization ?? '',
      tokenType,
    });
    req.credentials = { user, decoded };
    return true;
  }
}
