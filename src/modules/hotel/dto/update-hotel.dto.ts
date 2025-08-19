import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateHotelDto {
  @ApiProperty({
    description: 'Name of the hotel',
    example: 'Kim Hotel',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Address of the hotel',
    example: 'So 24, Ngo 165, Khuong Thuong, Dong Da, Ha Noi',
  })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Details description of the hotel',
    example: 'A luxury beachfront resort with spa and pool services.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Average rating of the hotel (1 to 5)',
    example: 4.5,
  })
  @IsOptional()
  @IsNumber()
  rating?: number;
  @ApiProperty({
    description: 'List of image URLs for the room',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Number of rating submissions',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  rating_count?: number;
}
