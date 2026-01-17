import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './commen/services/s3.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly s3Service: S3Service
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
