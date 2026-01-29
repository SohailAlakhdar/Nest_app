import { SetMetadata } from '@nestjs/common';
import { tokenEnum } from '../enums/token.enum';
export const tokenName = 'tokenType';
export const tokenType = (type: tokenEnum = tokenEnum.access) => {
  return SetMetadata(tokenName, type);
};
