import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '@/modules/token/token.service';
import { CreateRefreshTokenDto } from '@/modules/token/dto/create-refreshToken.dto';
import { UserType } from './auth';
import { comparePassword, hashPassword } from '@/helpers';
import { CreateAuthDto } from './dto/create-auth.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import dayjs from 'dayjs';
import { ResendCodeDto } from './dto/resend-code.dto';
import { generateCode, generateResetCode } from '@/utils';
import { MailerService } from '@nestjs-modules/mailer';
import { RedisService } from '@/modules/redis/redis.service';
import { ROLES } from '@/constant';
import { RefreshTokenRepo } from '@/modules/token/token.repo';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private redisService: RedisService,
    private readonly mailerService: MailerService,
    private readonly refreshTokenRepo: RefreshTokenRepo,
  ) { }

  async validateUser(account: string, password: string) {
    const user = await this.usersService.findOneByLogin(account);
    if (!user) throw new BadRequestException('user not found!');

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) throw new BadRequestException('Invalid password!');

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
      throw new BadRequestException('Invalid refresh token data!');
    }

    // Save refresh token to MongoDB using TokenService
    await this.tokenService.saveRefreshToken(refreshTokenDto);

    return {
      user: {
        _id,
        email,
        username,
        role,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const {
      username,
      email,
      password,
      confirmPassword,
      phone,
      address,
      gender,
      date_of_birth,
    } = registerDto;

    if (password !== confirmPassword)
      throw new BadRequestException('Password does not match!');

    if (!this.usersService.isValidPassword(password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters long, contain 1 uppercase letter, and 1 special character!',
      );
    }

    const isUserExist = await this.usersService.isUserNameExist(username);
    if (isUserExist) {
      throw new BadRequestException(
        'Username already exists! Please use another username',
      );
    }

    const isEmailExist = await this.usersService.isEmailExist(email);
    if (isEmailExist) {
      throw new BadRequestException(
        'Email already exists! Please use another email',
      );
    }

    const baseUsername = this.usersService.generateUsername(username);
    let userName = baseUsername;
    let count = 1;

    while (await this.usersService.isUserNameExist(userName)) {
      userName = `${baseUsername}${count}`;
      count++;
    }

    const hashedPassword = await hashPassword(password);
    const activationCode = generateCode();

    const user = await this.usersService.createUser({
      username: userName,
      email,
      password: hashedPassword,
      phone,
      address,
      gender,
      date_of_birth,
      isActive: false,
      role: ROLES.admin,
      codeId: activationCode,
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your HoLLa account',
      template: 'register',
      context: {
        name: user?.username ?? user?.email,
        activationCode: user.codeId,
      },
    });

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const { email, codeId } = verifyAccountDto;

    const foundUser = await this.usersService.findByEmail({ email });
    if (!foundUser) throw new BadRequestException('Account not found!');

    if (codeId !== foundUser.codeId)
      throw new BadRequestException('The code invalid or expried!');

    if (!dayjs().isBefore(foundUser.codeExpired))
      throw new BadRequestException('The code invalid or expried!');

    await foundUser.updateOne({ isActive: true });

    return {};
  }

  async resendCode(resendCodeDto: ResendCodeDto) {
    const { email } = resendCodeDto;

    const foundUser = await this.usersService.findByEmail({ email });
    if (!foundUser) throw new BadRequestException('Account not found');

    foundUser.codeId = generateCode();
    foundUser.codeExpired = dayjs().add(5, 'minutes').toDate();

    await foundUser.save();

    // Send mail
    this.mailerService.sendMail({
      to: foundUser.email, // List to reciver
      subject: 'Resend code to your account at HoLLa', // Subject line
      template: 'resend-code',
      context: {
        name: foundUser?.username ?? foundUser?.email,
        activationCode: foundUser.codeId,
      },
    });

    return {};
  }

  async sendResetPasswordEmail(email: string) {
    const TIME_ONE_HOUR = 3600;
    const foundUser = await this.usersService.findByEmail({ email });
    if (!foundUser)
      throw new BadRequestException('User with this email does not exist!');

    const code = generateCode();
    const ttl = TIME_ONE_HOUR; // code expiration time in seconds (1 hour)

    // Cache code in Redis
    await this.redisService.set(`reset-password:${email}`, code, ttl);

    // Send mail
    this.mailerService.sendMail({
      to: foundUser.email, // List to reciver
      subject: 'HoLLa Password Reset', // Subject line
      template: 'forgot-password',
      context: {
        name: foundUser?.username ?? foundUser?.email,
        resetCode: code,
      },
    });

    return { message: 'Otp reset password has been sent to email!' };
  }

  async checkValidCode(code: string, email: string) {
    const TIME_ONE_HOUR = 3600;
    if (!code) throw new BadRequestException('Invalid or expired code!');

    const cachedCode = await this.redisService.get(`reset-password:${email}`);
    if (!cachedCode || cachedCode !== code)
      throw new BadRequestException('Invalid or expired code!');

    const token = this.jwtService.sign({ email });
    const ttl = TIME_ONE_HOUR;

    // Delete code has use in Redis
    await this.redisService.del(`reset-password:${email}`);

    // Cache token in Redis
    await this.redisService.set(`reset-password-token:${email}`, token, ttl);

    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    let email: string;

    // Decode token to extract email
    try {
      const decoded = this.jwtService.verify(token);
      email = decoded.email;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token!');
    }

    // Verify token from Redis
    const cachedToken = await this.redisService.get(
      `reset-password-token:${email}`,
    );
    if (!cachedToken || cachedToken !== token)
      throw new UnauthorizedException('Invalid or expired token!');

    const user = await this.usersService.findByEmail({ email });
    if (!user) throw new BadRequestException('User does not exist!');

    user.password = await hashPassword(newPassword);
    await user.save();

    // Remove token from Redis after successful password reset
    await this.redisService.del(`reset-password-token:${email}`);

    return { message: 'Password reset successfully!' };
  }

  async handleRefreshToken(userId: string, refreshToken: string) {
    const hasToken = await this.refreshTokenRepo.findOneByUserId(userId);
    if (!hasToken) throw new UnauthorizedException('Invalid refresh token!');

    // Compare stored refreshToken with provided one
    if (hasToken.token !== refreshToken)
      throw new UnauthorizedException('Invalid refresh token!');

    const hasUser: any = await this.usersService.findOneById(userId);

    const payload = { email: hasUser.email, sub: hasUser._id, role: hasUser.role };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'), // Expiration for accessToken
    });

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'), // Expiration for refreshToken
    });

    // Store refreshToken in the database
    await this.tokenService.handleRefreshToken(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    const hasUser = await this.usersService.findOneById(userId);
    if (!hasUser) throw new BadRequestException('User not found!');

    const hasToken = await this.refreshTokenRepo.findOneByUserId(userId);
    if (!hasToken) throw new BadRequestException('User is already logged out!');

    // Delete the refresh token
    await hasToken.deleteOne();

    return {};
  }
}
