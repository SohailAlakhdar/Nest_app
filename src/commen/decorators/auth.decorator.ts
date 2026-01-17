import { applyDecorators, UseGuards } from '@nestjs/common';
import { tokenEnum } from '../enums/token.enum';
import { Roles } from './role.decorator';
import { Token } from './tokenType.decorator';
import { RoleEnum } from '../enums/user.enum';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';

export function Auth(roles: RoleEnum[], type?: tokenEnum) {
  return applyDecorators(
    Roles(...roles),
    Token(type),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
