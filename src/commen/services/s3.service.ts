import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
    DeleteObjectCommand,
    DeleteObjectCommandOutput,
    DeleteObjectsCommand,
    DeleteObjectsCommandOutput,
    GetObjectCommand,
    GetObjectCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2CommandOutput,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";

import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageEnum } from "../enums/multer.enum";
import { randomUUID } from "crypto";


@Injectable()
export class S3Service {
    private readonly s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }
    // ================= Upload File =================
    async uploadFile({
        storageApproach = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME!,
        ACL = "private",
        path = "general",
        file,
    }: {
        storageApproach?: storageEnum;
        Bucket?: string;
        ACL?: ObjectCannedACL;
        path: string;
        file: Express.Multer.File;
    }): Promise<string> {
        const Key = `${process.env.APP_NAME}/${path}/${randomUUID()}_${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket,
            ACL,
            Key,
            Body:
                storageApproach === storageEnum.memory
                    ? file.buffer
                    : createReadStream(file.path),
            ContentType: file.mimetype,
        });

        await this.s3.send(command);
        return Key;
    }
    // upload-Large-File
    async uploadLargeFile({
        storageApproach = storageEnum.disk,
        Bucket = process.env.AWS_BUCKET_NAME!,
        ACL = "private",
        path = "general",
        file,
    }: {
        storageApproach?: storageEnum;
        Bucket?: string;
        ACL?: ObjectCannedACL;
        path: string;
        file: Express.Multer.File;
    }): Promise<string> {
        const Key = `${process.env.APP_NAME}/${path}/${randomUUID()}_${file.originalname}`;
        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket,
                ACL,
                Key,
                Body:
                    storageApproach === storageEnum.memory
                        ? file.buffer
                        : createReadStream(file.path),
                ContentType: file.mimetype,
            },
            queueSize: 4,
            partSize: 5 * 1024 * 1024,
        });

        await upload.done();
        return Key;
    }

    // Upload-Files && upload-Large-Files
    async uploadFiles({
        storageApproach = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        ACL = "private", // "authenticated-read" | "public-read"
        path = "general",
        files,
        useLarge = false,
    }: {
        storageApproach?: storageEnum;
        Bucket?: string;
        ACL?: ObjectCannedACL;
        path: string;
        files: Express.Multer.File[];
        useLarge?: boolean;
    }): Promise<string[]> {
        let urls: string[] = [];
        if (useLarge) {
            urls = await Promise.all(
                files.map((file) => {
                    return this.uploadLargeFile({
                        Bucket,
                        ACL,
                        path,
                        file,
                        storageApproach,
                    });
                })
            );
        } else {
            urls = await Promise.all(
                files.map((file) => {
                    return this.uploadFile({
                        Bucket,
                        ACL,
                        path,
                        file,
                        storageApproach,
                    });
                })
            );
        }
        return urls;
    };

    // Create-Pre-Signed-Upload-Link
    async createPreSignedUploadLink({
        Bucket = process.env.AWS_BUCKET_NAME!,
        path = "general",
        expiresIn = 120,
        ContentType,
        originalname,
    }: {
        Bucket?: string;
        path?: string;
        expiresIn?: number;
        ContentType: string;
        originalname: string;
    }): Promise<{ url: string; Key: string }> {
        const Key = `${process.env.APP_NAME}/${path}/${randomUUID()}_${originalname}`;

        const command = new PutObjectCommand({
            Bucket,
            Key,
            ContentType,
        });

        const url = await getSignedUrl(this.s3, command, { expiresIn });
        return { url, Key };
    }

    // Create-Get-Pre-Signed-link
    async createGetPreSignedLink({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key,
        expiresIn = 120,
        downloadName = "dummy",
        downloadBoolean = "false",
    }: {
        Bucket?: string;
        Key: string;
        downloadName?: string;
        downloadBoolean?: string;
        expiresIn?: number;
    }): Promise<string> {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition:
                downloadBoolean === "true"
                    ? `attachment; filename="${downloadName || Key.split("/").pop()
                    }"`
                    : undefined,
        });
        const url = await getSignedUrl(this.s3, command, { expiresIn });
        if (!url) {
            throw new BadRequestException("Fial to create pre sign url");
        }
        return url;
    };

    // Get-File-----------------
    async getFile({
        Key,
        Bucket = process.env.AWS_BUCKET_NAME as string,
    }: {
        Key: string;
        Bucket?: string;
    }): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Key,
            Bucket,
        });
        return await this.s3.send(command);
    };

    // Delet-File--------------
    async deleteFile({
        Key,
        Bucket = process.env.AWS_BUCKET_NAME as string,
    }: {
        Key: string;
        Bucket?: string;
    }): Promise<DeleteObjectCommandOutput> {
        const command = new DeleteObjectCommand({
            Key,
            Bucket,
        });
        return await this.s3.send(command);
    };

    // Delete-File-------------
    async deleteFiles({
        urls,
        Quiet = false,
        Bucket = process.env.AWS_BUCKET_NAME as string,
    }: {
        urls: string[];
        Quiet?: boolean;
        Bucket?: string;
    }): Promise<DeleteObjectsCommandOutput> {
        const Objects = urls.map((url) => {
            return { Key: url };
        });
        console.log({ Objects: Objects });

        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet, // to show less
            },
        });
        return await this.s3.send(command);
    };

    // List files [-------------]
    async listDirectoryFiles({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path,
    }: {
        Bucket?: string;
        path: string;
    }): Promise<ListObjectsV2CommandOutput> {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: `${process.env.APP_NAME}/${path}`,
            // Prefix:` Route_Social_App/users/68c672b9b423b00ce8a46d0a`,
        });
        return await this.s3.send(command);
    };

    // Delete-Files-By-Prefix
    async deleteFolderByPrefix({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path,
        Quiet = false,
    }: {
        Bucket?: string;
        path: string;
        Quiet?: boolean;
    }): Promise<DeleteObjectCommandOutput> {
        const fileList = await this.listDirectoryFiles({
            path,
        });
        if (!fileList?.Contents?.length) {
            throw new BadRequestException("empty directory");
        }
        const urls: string[] = fileList.Contents.map((file) => {
            return file.Key as string;
        });
        if (!urls) {
            throw new NotFoundException("not found url ");
        }
        return await this.deleteFiles({ urls, Quiet, Bucket });
    };

}