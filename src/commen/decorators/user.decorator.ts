import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let req: any;
    let ctx: any;
    switch (context.getType()) {
      case 'http':
        req = context.switchToHttp().getRequest();
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
    return req.credentials.user;
  },
);
