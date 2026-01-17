import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import { diskStorage, memoryStorage } from "multer";
// import * as path from 'path';
import path from 'path';
import { fileValidation } from "./valition.multer";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { storageEnum } from "src/commen/enums/multer.enum";
import { tmpdir } from "os";
const MB: number = 1024 * 1024;

export const cloudMulter = (
    {
        storageApproch = storageEnum.memory,
        fileSizeMB = 2, // 2MB
        validation = []
    }: {
        storageApproch?: storageEnum,
        fileSizeMB?: number;
        validation?: string[]
    }
): MulterOptions => {
    return {
        storage:
            storageApproch === storageEnum.memory
                ? memoryStorage()
                : diskStorage({
                    destination: tmpdir(),
                    filename: function (
                        req: Request,
                        file: Express.Multer.File,
                        cb
                    ) {
                        cb(null, `${randomUUID()}_${file.originalname}`);
                    },
                }),
        limits: {
            fileSize: fileSizeMB * MB,
        },
        fileFilter: (req: Request, file: Express.Multer.File, cb: Function
        ) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!validation.includes(ext)) {
                return cb(
                    new BadRequestException('Invalid file extension'),
                    false
                );
            }
            if (!file.mimetype.startsWith('image/')) {
                return cb(
                    new BadRequestException('Only image files are allowed'),
                    false
                );
            }
            cb(null, true);
        }
    }
}
