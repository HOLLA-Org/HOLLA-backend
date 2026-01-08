import multer from 'multer';
import sharp from 'sharp';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new BadRequestException('Only images are allowed!'),
        false,
      );
    }
    cb(null, true);
  },
};

export const compressImage = async (
  file: Express.Multer.File,
): Promise<Buffer> => {
  const image = sharp(file.buffer).resize({ width: 800 });

  if (file.mimetype === 'image/png') {
    return image.png({ quality: 80 }).toBuffer();
  }

  if (file.mimetype === 'image/webp') {
    return image.webp({ quality: 80 }).toBuffer();
  }

  return image.jpeg({ quality: 80 }).toBuffer();
};
