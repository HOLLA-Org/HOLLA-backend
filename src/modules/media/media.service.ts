import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UploadApiResponse,
  UploadApiOptions,
  v2 as Cloudinary,
} from 'cloudinary';
import { Model, Types } from 'mongoose';
import { Readable } from 'stream';
import { Media, MediaDocument } from './schemas/media.schema';
import { compressImage } from '@/config/upload.config';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    @Inject('Cloudinary') private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadAndSave(
    file: Express.Multer.File,
    options: UploadApiOptions,
    relations: {
      owner_id?: Types.ObjectId;
      hotel_id?: Types.ObjectId;
      room_id?: Types.ObjectId;
    },
  ): Promise<MediaDocument> {
    try {
      const compressedBuffer = await compressImage(file);
      const uploadResult = await this._uploadToCloudinary(
        compressedBuffer,
        options,
      );
      return this._createMediaRecord(uploadResult, relations);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to upload and save media.',
      );
    }
  }

  async deleteFile(public_id: string): Promise<void> {
    if (!public_id) return;
    try {
      await this.cloudinary.uploader.destroy(public_id);
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
    }
  }

  private _uploadToCloudinary(
    buffer: Buffer,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        options,
        (err, res) => {
          if (err || !res) {
            return reject(new Error('Cloudinary upload failed'));
          }
          resolve(res);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  private _createMediaRecord(
    uploadResult: UploadApiResponse,
    relations: Record<string, Types.ObjectId>,
  ): Promise<MediaDocument> {
    const newMedia = new this.mediaModel({
      public_id: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      ...relations,
    });
    return newMedia.save();
  }
}
