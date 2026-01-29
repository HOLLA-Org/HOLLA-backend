import { Module } from '@nestjs/common';
import { AuthAdminService } from './auth.service';
import { AuthAdminController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '@/modules/token/token.module';
import { LocalAdminStrategy } from './passport/local.strategy';
import { RedisModule } from '@/modules/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    TokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    RedisModule,
  ],
  controllers: [AuthAdminController],
  providers: [AuthAdminService, LocalAdminStrategy, JwtStrategy],
})
export class AuthAdminModule { }
