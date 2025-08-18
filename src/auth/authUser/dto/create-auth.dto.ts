import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAuthDto {
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

  @ApiProperty({
    required: false,
    example: 'male',
    description: 'Gender of the user (optional)',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  gender?: string;

  @ApiProperty({
    required: false,
    example: '2000-01-01',
    description: 'Date of birth in ISO format (optional)',
  })
  @IsOptional()
  date_of_birth?: Date;
}
