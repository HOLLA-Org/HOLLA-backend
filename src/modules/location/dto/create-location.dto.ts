import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
    @ApiProperty({ example: 'Hà Nội', description: 'Name of the province/city' })
    @IsString()
    name: string;


    @ApiPropertyOptional({ example: 'Hà Nội, Việt Nam' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: 21.0285 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 105.8542 })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ example: true, description: 'Is this a popular location?' })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;
}
