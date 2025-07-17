import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  emamil: string;

  @IsNotEmpty()
  password: string;

  phone: string;
  address: string;
  image: string;
}
