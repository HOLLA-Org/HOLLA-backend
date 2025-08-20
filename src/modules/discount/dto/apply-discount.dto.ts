import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({
    example: 'SUMMER25',
    description: 'The discount code to be apply',
  })
  @IsString()
  code: string;
}
