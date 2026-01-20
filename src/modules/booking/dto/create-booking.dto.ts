// src/bookings/dto/create-booking.dto.ts
import { BookingType } from '@/constant';
import { ToDate } from '@/decorator/to-date.decorator';
import { ToObjectId } from '@/decorator/to-object-id.decorator';
import { IsObjectId } from '@/decorator/is-object-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsDate,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the hotel being booked',
    example: '64d3b1f9c3b4e5f6a7b8c9d0',
  })
  @IsNotEmpty()
  @ToObjectId()
  @IsObjectId()
  hotel_id: Types.ObjectId;

  @ApiProperty({
    description: 'Check-in date and time',
    example: '2024-08-20T00:00:00Z',
  })
  @ToDate()
  @IsDate()
  check_in: Date;

  @ApiProperty({
    description: 'Check-out date and time',
    example: '2024-08-21T00:00:00Z',
  })
  @ToDate()
  @IsDate()
  check_out: Date;

  @ApiProperty({
    enum: BookingType,
    description: 'Type of booking',
    example: BookingType.PER_DAY,
  })
  @IsEnum(BookingType)
  booking_type: BookingType;
}
