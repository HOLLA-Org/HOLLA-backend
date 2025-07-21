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
    const hasToken = await this.tokenModel.findOne({ user: userId });
    if (!hasToken) throw new NotFoundException();

    return hasToken;
  }
}
