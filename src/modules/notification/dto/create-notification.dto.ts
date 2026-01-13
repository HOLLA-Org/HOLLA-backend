import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'Setup completed',
    description: 'Notification title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Congratulations! Your setup was completed successfully.',
    description: 'Notification content/message',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'system',
    description: 'Notification type',
    enum: ['system', 'profile', 'order'],
  })
  @IsString()
  @IsOptional()
  type?: string;
}
