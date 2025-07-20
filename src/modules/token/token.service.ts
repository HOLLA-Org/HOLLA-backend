import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { validate } from 'class-validator';
import { CreateRefreshTokenDto } from './dto/create-refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async saveRefreshToken(
    createRefreshToken: CreateRefreshTokenDto,
  ): Promise<RefreshTokenDocument> {
    // Validate the DTO
    const errors = await validate(createRefreshToken);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid refresh token data');
    }

    // Create a new refresh token document
    const refreshTokenDoc = new this.refreshTokenModel({
      token: createRefreshToken.token,
      user: createRefreshToken.user,
      expiresAt: new Date(createRefreshToken.expiresAt),
      createdAt: createRefreshToken.createdAt
        ? new Date(createRefreshToken.createdAt)
        : new Date(),
      revoked: false,
      refreshTokenUsed: createRefreshToken.refreshTokenUsed || [],
    });

    // Save to MongoDB
    return await refreshTokenDoc.save();
  }

  async handleRefreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      // Find the refresh token document for the user
      const refreshTokenDoc = await this.refreshTokenModel.findOne({
        user: userId,
        revoked: false,
      });

      // Check if the provided refresh token is in refreshTokenUsed
      if (
        refreshTokenDoc &&
        refreshTokenDoc.refreshTokenUsed.includes(refreshToken)
      ) {
        refreshTokenDoc.revoked = true;
        await refreshTokenDoc.save();
        throw new UnauthorizedException(
          'Refresh token has been used and revoked',
        );
      }

      // Check if token is valid and not expired
      if (
        !refreshTokenDoc ||
        refreshTokenDoc.expiresAt < new Date() ||
        refreshTokenDoc.token !== refreshToken
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new access and refresh tokens
      const newPayload = { email: payload.email, sub: userId };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      });

      // Upsert the new refresh token, setting token and pushing old token to refreshTokenUsed
      await this.refreshTokenModel.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            revoked: false,
          },
          $push: {
            refreshTokenUsed: refreshToken,
          },
        },
        { new: true, upsert: true },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
