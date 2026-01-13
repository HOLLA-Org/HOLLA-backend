import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Mark notification as read',
  })
  @IsBoolean()
  @IsOptional()
  is_read?: boolean;
}
