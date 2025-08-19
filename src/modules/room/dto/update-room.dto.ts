import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({ description: 'The room number or name', example: 'P.101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type of the room', example: 'Deluxe' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Price per hour', example: 50000 })
  @IsNumber()
  @Min(0)
  price_per_hour: number;

  @ApiProperty({ description: 'Price per day', example: 500000 })
  @IsNumber()
  @Min(0)
  price_per_day: number;

  @ApiProperty({ description: 'Price for an overnight stay', example: 350000 })
  @IsNumber()
  @Min(0)
  price_overnight: number;

  @ApiProperty({
    description: 'Availability status of the room',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean = true;

  @ApiProperty({
    description: 'List of image URLs for the room',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
