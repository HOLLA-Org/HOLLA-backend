import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { ToObjectId } from '@/decorator/to-object-id.decorator';
import { IsObjectId } from '@/decorator/is-object-id.decorator';

export class CreatePaymentDto {
  @ApiProperty({
    description: ' Booking id associated with the payment',
    example: '64e8c9f9a2b3c4d5e6f7a8b9',
  })
  @ToObjectId()
  @IsObjectId()
  booking_id: Types.ObjectId;

  @ApiProperty({
    description: 'Payment method used',
    example: 'ZALOPAY',
  })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({
    description: 'Discount code (optional)',
    example: 'DISCOUNT20',
    required: false,
  })
  @IsString()
  @IsOptional()
  discount_code?: string;
}
