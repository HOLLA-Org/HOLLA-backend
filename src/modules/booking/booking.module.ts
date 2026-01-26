import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.shema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Hotel, HotelSchema } from '../hotel/schemas/hotel.schema';
import { Review, ReviewSchema } from '../review/schemas/review.schema';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schema';
import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Hotel.name, schema: HotelSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule { }
