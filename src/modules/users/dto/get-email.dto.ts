import { IsNotEmpty, MinLength } from 'class-validator';

export class GetEmailByUserNameDto {
  @IsNotEmpty()
  @MinLength(3)
  username: string;
}
