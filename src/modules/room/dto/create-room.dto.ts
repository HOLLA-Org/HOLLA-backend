import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'ID of the hotel this room belongs to',
    example: '64d3b1f9c3b4e5f6a7b8c9d0',
  })
  @IsNotEmpty()
  hotel_id: string;

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
