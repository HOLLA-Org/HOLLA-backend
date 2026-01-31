import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAmenityDto {
  @ApiProperty({ example: 'Wi-Fi miễn phí' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'wifi' })
  @IsString()
  @IsOptional()
  icon?: string;
}

