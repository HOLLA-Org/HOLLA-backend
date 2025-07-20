import { IsValidMongoId } from '@/common/validators/is-mongo-id.decorator';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTokenDto {
  @IsNotEmpty()
  @IsValidMongoId()
  userId: Types.ObjectId;

  @IsNotEmpty()
  refreshToken: string;
}
