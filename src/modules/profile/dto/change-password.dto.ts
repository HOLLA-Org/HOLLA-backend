import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123@' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Password123@' })
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;
}
