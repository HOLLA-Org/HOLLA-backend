// src/bookings/dto/create-booking.dto.ts
import { BookingType } from '@/constant';
import { ToDate } from '@/decorator/to-date.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsDate,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the user who is booking',
    example: '64d3b1f9c3b4e5f6a7b8c9d0',
  })
  @IsNotEmpty()
  @IsMongoId()
  user_id: string;

  @ApiProperty({
    description: 'ID of the room being booked',
    example: '64d3b1f9c3b4e5f6a7b8c9d0',
  })
  @IsNotEmpty()
  @IsMongoId()
  room_id: string;

  @ApiProperty({
    description: 'Check-in date and time',
    example: '00:00 20/08',
  })
  @ToDate()
  @IsDate()
  check_in: Date;

  @ApiProperty({
    description: 'Check-out date and time',
    example: '00:00 21/08',
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

  @ApiProperty({ description: 'Total price of the booking', example: 500000 })
  @IsNumber()
  @Min(0)
  total_price: number;
}
