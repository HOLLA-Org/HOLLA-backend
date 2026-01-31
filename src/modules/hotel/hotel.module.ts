import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schemas/hotel.schema';
import { MediaModule } from '../media/media.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Amenity, AmenitySchema } from '../amenity/schemas/amenity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: User.name, schema: UserSchema },
      { name: Amenity.name, schema: AmenitySchema },
    ]),
    MediaModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule { }
