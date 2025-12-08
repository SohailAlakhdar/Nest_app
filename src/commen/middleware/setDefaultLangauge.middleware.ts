import { tokenEnum } from './../enums/token.enum';
import { NextFunction, Request, Response } from 'express';

export const setDefaultLangauage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('language middleware...');
  req.headers['accept-language'] = req.headers['accept-language'] ?? 'EN';
  next();
};
