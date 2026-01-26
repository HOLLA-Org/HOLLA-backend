import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.shema';
import { DiscountModule } from '../discount/discount.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Hotel, HotelSchema } from '../hotel/schemas/hotel.schema';
import { Discount, DiscountSchema } from '../discount/schemas/discount.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Hotel.name, schema: HotelSchema },
      { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
    NotificationModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
