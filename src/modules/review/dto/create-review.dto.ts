import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { ToObjectId } from '@/decorator/to-object-id.decorator';
import { IsObjectId } from '@/decorator/is-object-id.decorator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Booking id associated with the review',
    example: '64e8c9f9a2b3c4d5e6f7a8b9',
  })
  @IsNotEmpty()
  @ToObjectId()
  @IsObjectId()
  booking_id: Types.ObjectId;

  @ApiProperty({
    description: 'Rating given by the user',
    example: 5,
  })
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ApiProperty({
    description: 'Optional comment for the review',
    example: 'Great stay! Would recommend.',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
