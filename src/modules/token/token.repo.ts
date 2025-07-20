import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenRepo {
  constructor(
    @InjectModel(RefreshToken.name) private tokenModel: Model<RefreshToken>,
    private configService: ConfigService,
  ) {}

  async findOneByUserId(userId: string) {
    const objectId = new Types.ObjectId(userId);
    const hasToken = await this.tokenModel.findOne({ userId: objectId });
    if (!hasToken) throw new NotFoundException();

    return hasToken;
  }
}
