import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vihongminh', description: 'Full name of the user' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Secure password' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).{6,}$/, {
    message:
      'Password must be at least 6 characters long, contain 1 uppercase letter, and 1 special character.',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    required: false,
    example: '+84987654321',
    description: 'Valid phone number (optional)',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  @IsOptional()
  phone?: string;

  @ApiProperty({
    required: false,
    example: '123 Main St, Hanoi, Vietnam',
    description: "The user's street address (optional)",
  })
  @IsOptional()
  address?: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/path/to/image.jpg',
    description: "URL of the user's profile picture (optional)",
  })
  @IsOptional()
  image?: string;
}
