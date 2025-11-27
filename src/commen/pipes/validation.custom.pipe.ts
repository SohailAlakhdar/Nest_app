/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  constructor(private schema:ZodType){}
  transform(value: any, metadata: ArgumentMetadata) {
    const{success, error}= this.schema.safeParse(value)
    if (!success) {
      throw new BadRequestException({
        message:"",
        cause:{
          issues:error.issues.map(issue=>{
            return {message:issue.message,path:issue.path}
          })
        }
      })
    }
    return value;
  }
}
