import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '@/modules/token/token.service';
import { CreateRefreshTokenDto } from '@/modules/token/dto/create-refreshToken.dto';
import { UserType } from './auth';
import { comparePassword } from '@/helpers';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(account: string, password: string) {
    const user = await this.usersService.findOneByLogin(account);
    if (!user) return null;

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) return null;

    return user;
  }

  async login(user: UserType) {
    const { _id, email, username, role } = user;
    const payload = { email, sub: _id, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'), // Expiration for accessToken
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'), // Expiration for refreshToken
    });

    // Create DTO for refresh token
    const refreshTokenDto = new CreateRefreshTokenDto();
    refreshTokenDto.token = refreshToken;
    refreshTokenDto.user = _id.toString();
    refreshTokenDto.expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    refreshTokenDto.createdAt = new Date().toISOString();
    refreshTokenDto.refreshTokenUsed = [];

    // Validate DTO
    const errors = await validate(refreshTokenDto);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid refresh token data');
    }

    // Save refresh token to MongoDB using TokenService
    await this.tokenService.saveRefreshToken(refreshTokenDto);

    return {
      user: {
        _id,
        email,
        username,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
