import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  UploadApiOptions,
  UploadApiResponse,
  v2 as Cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';
import { compressImage } from '@/config/upload.config';

@Injectable()
export class MediaService {
  constructor(
    @Inject('Cloudinary') private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    options?: UploadApiOptions,
  ): Promise<string> {
    try {
      const compressedBuffer = await compressImage(file);

      const result = await this.uploadToCloudinary(
        compressedBuffer,
        options,
      );

      return result.secure_url;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Upload image failed',
      );
    }
  }

  private uploadToCloudinary(
    buffer: Buffer,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        options,
        (err, res) => {
          if (err || !res) {
            return reject(err);
          }
          resolve(res);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }
}
