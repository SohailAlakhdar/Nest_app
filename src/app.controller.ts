import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { createS3WriteStreamPipe, S3Service } from './commen/services/s3.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly s3Service: S3Service) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('upload/pre-signed/*path')
  async getPreSignedAsset(
    // @Query query: {
    //   downloadName?: string;
    //   downloadBoolean?: string;
    // },
    @Param() params: { path: string[] },
    @Res() res: Response,
    // @Param("path") path: string[],
    @Query("downloadName") downloadName?: string,
    @Query("downloadBoolean") downloadBoolean?: string,
  ) {
    // const { downloadName, downloadBoolean } = query as {
    //   downloadName?: string;
    //   downloadBoolean?: string;
    // };
    const { path } = params;
    console.log({ path });

    const Key = path.join("/");
    // const realKey = Key.replace(/^pre-signed\//, "");
    // console.log({ KEY: realKey });
    console.log({ KEY: Key });
    const url = await this.s3Service.createGetPreSignedLink({
      Key: Key as string,
      downloadName: downloadName as string,
      downloadBoolean: downloadBoolean as string,
    });
    return res.send(`
      <a href="${url}" target="_blank">URL:${url}</a>
  `);
  }

  @Get('upload/*path')
  async getAsset(
    // @Query query: { downlaad?: string },
    // @Param params: { path: string[] },
    @Res() res: Response,
    @Param("path") path: string[],
    @Query("download") download?: string,
    // @Query("downloadBoolean") downloadBoolean?: string,

  ) {
    // const download = query
    // const { path } = params
    const Key = path.join("/");
    const s3Response = await this.s3Service.getFile({ Key });

    const fileName = Key.split("_").pop();

    if (!s3Response.Body) {
      throw new BadRequestException("Fail to fetch this data");
    }
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Content-type",
      `${s3Response.ContentType || "routerlication/octet-stream"}`
    );
    if (download) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || Key.split("/").pop()
        }"`
      );
    }

    return await createS3WriteStreamPipe(
      s3Response.Body as ReadableStream,
      res
    );
  }


}
