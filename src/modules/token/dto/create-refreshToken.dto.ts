import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  refreshTokenUsed?: string[];
}
