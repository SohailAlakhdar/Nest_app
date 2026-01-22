import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleEnum } from 'src/commen/enums/user.enum';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const accessRoles = this.reflector.getAllAndOverride<RoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    let ctx: any;
    let req: any;
    let role: RoleEnum = RoleEnum.User;
    switch (context.getType()) {
      case 'http':
        role = context.switchToHttp().getRequest().credentials.user.role;
        break;
      case 'rpc':
        ctx = context.switchToRpc();
        break;
      case 'ws':
        ctx = context.switchToWs();
        break;

      default:
        break;
    }

    return accessRoles.includes(role);
  }
}
