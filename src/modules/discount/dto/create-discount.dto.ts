import { ToDate } from '@/decorator/to-date.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsDate,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'The unique code for the discount',
    example: 'SUMMER25',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'The value of the discount',
    example: 25,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'A brief description of the discount',
    example: '25% off for all summer items',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The maximum number of times the discount can be used.',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  max_usage?: number;

  @ApiProperty({
    description: 'The expiration date of the discount code',
    example: '2026-08-21T00:00:00.000Z',
    required: false,
  })
  @ToDate()
  @IsDate()
  expires_at?: Date;
}
