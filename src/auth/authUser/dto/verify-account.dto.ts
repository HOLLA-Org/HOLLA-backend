import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({
    example: 'vihongminh',
    description: 'Account can be either a username or an email',
  })
  @IsNotEmpty()
  account: string;

  @ApiProperty({ example: '123456', description: 'Verification code' })
  @IsNotEmpty()
  codeId: string;
}
