import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
// import * as path from 'path';
import path from 'path';
import { fileValidation } from "./valition.multer";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
const MB: number = 1024 * 1024;

export const localMulter = (
    {
        folder = 'public',
        fileSizeMB = 2, // 2MB
        validation = []
    }: {
        folder?: string;
        fileSizeMB?: number;
        validation?: string[]
    }
) :MulterOptions=> {
    return {
        storage: diskStorage({
            destination: (req: Request, file: Express.Multer.File, cb: Function
            ) => {
                // const uploadPath = `uploads/${folder}`;
                const uploadPath = path.resolve(`./uploads/${folder}`);
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req: Request, file: Express.Multer.File, cb: Function
            ) => {
                const fileName = randomUUID() + '_' + Date.now() + '_' + file.originalname;
                cb(null, fileName)
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
