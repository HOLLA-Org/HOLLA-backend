import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Username of the user',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Phone number (10 digits)',
  })
  @IsOptional()
  @Matches(/^(0|\+84)[0-9]{9}$/, {
    message: 'Phone number must be a valid Vietnamese number',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Le Loi Street, District 1, Ho Chi Minh City',
    description: 'Address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Male',
    description: 'Gender',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    example: '2000-01-01',
    description: 'Date of birth',
  })
  @IsOptional()
  date_of_birth?: Date;
}
