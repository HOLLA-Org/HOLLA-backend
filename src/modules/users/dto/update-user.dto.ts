import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Matches,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty({ example: 'vihongminh', description: 'Full name of the user' })
  @IsOptional()
  username?: string;

  @ApiProperty({
    required: false,
    example: '+84987654321',
    description: 'Valid phone number',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    required: false,
    example: '123 Main St, Hanoi, Vietnam',
    description: "The user's street address",
  })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 10.776889 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 106.700806 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    required: false,
    example: 'male',
    description: 'Gender of the user',
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', ''])
  gender?: string;

  @ApiProperty({
    required: false,
    example: '2000-01-01',
    description: 'Date of birth (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;
}
