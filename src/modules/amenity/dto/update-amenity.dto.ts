import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAmenityDto {
  @ApiPropertyOptional({ example: 'Wi-Fi tốc độ cao' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'wifi' })
  @IsString()
  @IsOptional()
  icon?: string;
}
