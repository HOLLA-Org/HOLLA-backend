import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './core/transform.interceptor';
import { AuthUserModule } from './modules/auth/authUser/auth.module';
import { AuthAdminModule } from './modules/auth/authAdmin/auth.module';
import { JwtAuthGuard } from './modules/auth/authUser/passport/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HotelModule } from './modules/hotel/hotel.module';
import { BookingModule } from './modules/booking/booking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './modules/payment/payment.module';
import { DiscountModule } from './modules/discount/discount.module';
import { ReviewModule } from './modules/review/review.module';
import { MediaModule } from './modules/media/media.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RolesGuard } from './modules/auth/roles.guard';
import { NotificationModule } from './modules/notification/notification.module';
import { LocationModule } from './modules/location/location.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { AmenityModule } from './modules/amenity/amenity.module';
import { StatisticModule } from './modules/statistic/statistic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthUserModule,
    AuthAdminModule,
    StatisticModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 456,
          // secure: true,
          // ignoreTLS: true,
          // secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    HotelModule,
    BookingModule,
    PaymentModule,
    DiscountModule,
    ReviewModule,
    MediaModule,
    ProfileModule,
    NotificationModule,
    LocationModule,
    FavoriteModule,
    AmenityModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }
