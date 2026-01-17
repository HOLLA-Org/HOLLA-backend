import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Hotel, HotelSchema } from '@/modules/hotel/schemas/hotel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Hotel.name, schema: HotelSchema },
    ]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
