import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: 'vihongminh', description: 'Full name of the user' })
  @IsNotEmpty()
  fullName: string;

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
  password: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'Must match the password',
  })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).{6,}$/, {
    message:
      'Password must be at least 6 characters long, contain 1 uppercase letter, and 1 special character.',
  })
  confirmPassword: string;

  @ApiProperty({
    required: false,
    example: '+84987654321',
    description: 'Valid phone number (optional)',
  })
  @IsOptional()
  @ValidateIf((obj) => obj.phoneNumber !== null && obj.phoneNumber !== '')
  @IsPhoneNumber('VN')
  phoneNumber?: string;

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
