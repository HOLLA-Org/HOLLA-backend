import multer from 'multer';
import sharp from 'sharp';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only images are allowed!'), false);
    }
    cb(null, true);
  },
};

export const compressImage = async (
  file: Express.Multer.File,
): Promise<Buffer> => {
  return await sharp(file.buffer)
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
    .toBuffer();
};
