import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ example: 'Kim Hotel' })
  @IsString()
  name: string;

  @ApiProperty({ example: '24 Nguyễn Huệ, Q1, TP.HCM' })
  @IsString()
  address: string;

  @ApiProperty({ example: 10.776889 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 106.700806 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 40000 })
  @IsOptional()
  @IsNumber()
  priceHour?: number;

  @ApiPropertyOptional({ example: 400000 })
  @IsOptional()
  @IsNumber()
  priceDay?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  totalRooms?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  availableRooms?: number;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  ratingCount?: number;

  @ApiPropertyOptional({
    example: ['https://example.com/img1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({
    example: [
      '66c9f4c1a8e123456789abcd',
      '66c9f4c1a8e123456789abce',
    ],
  })
  @IsOptional()
  @IsArray()
  amenities?: string[];
}
