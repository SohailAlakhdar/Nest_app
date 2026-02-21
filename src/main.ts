import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultLangauage } from './commen/middleware/setDefaultLangauge.middleware';
import { LoggingInterceptor } from './commen/interceptors/watchRequest.interceptors';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use("order/webhook", express.raw({ type: 'application/json' }));

  app.use('upload', express.static(path.resolve('upload')));
  app.use(setDefaultLangauage);

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );
  app.use(express.json());
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port, () => {
    console.log(`Server is running on port::: ${port} 🚀`);
  });
}
bootstrap();
