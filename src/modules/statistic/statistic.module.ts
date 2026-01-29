import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { Booking, BookingSchema } from '@/modules/booking/schemas/booking.shema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Booking.name, schema: BookingSchema },
        ]),
    ],
    controllers: [StatisticController],
    providers: [StatisticService],
    exports: [StatisticService],
})
export class StatisticModule { }
