import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+84987654321', description: 'Valid phone number' })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phoneNumber: string;

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
}
