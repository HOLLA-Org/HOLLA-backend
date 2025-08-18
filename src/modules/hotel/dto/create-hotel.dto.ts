import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateHotelDto {
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

  @ApiPropertyOptional({
    description: 'Hotel images (comma-separated URLs or a single URL)',
    example: 'https://example.com/image1.jpg',
  })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional({
    description: 'Number of rating submissions',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  rating_count?: number;
}
