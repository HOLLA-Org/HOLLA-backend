import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty({ example: 'vihongminh', description: 'Full name of the user' })
  @IsOptional()
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address',
  })
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Secure password' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).{6,}$/, {
    message:
      'Password must be at least 6 characters long, contain 1 uppercase letter, and 1 special character.',
  })
  @IsOptional()
  password: string;

  @ApiProperty({
    required: false,
    example: 'ADMIN',
    description: "User's role",
  })
  @IsOptional()
  role: string;

  @ApiProperty({
    required: false,
    example: '+84987654321',
    description: 'Valid phone number',
  })
  @IsOptional()
  phone: string;

  @ApiProperty({
    required: false,
    example: '123 Main St, Hanoi, Vietnam',
    description: "The user's street address",
  })
  @IsOptional()
  address: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/path/to/image.jpg',
    description: "URL of the user's profile picture (optional)",
  })
  @IsOptional()
  image: string;
}
