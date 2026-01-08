import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryProvider } from '@/config/cloudinary.provider';

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryProvider],
  exports: [MediaService],
})
export class MediaModule {}
