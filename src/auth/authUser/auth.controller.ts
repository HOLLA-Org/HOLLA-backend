import { Public, ResponseMessage } from '@/decorator/customize';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { ApiTags } from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { ResendCodeDto } from './dto/resend-code.dto';

@ApiTags('Authentication User') // Swagger category
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        account: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['account', 'password'],
    },
  })
  @ResponseMessage('Login successfully')
  async handleLogin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({ status: 201, description: 'Register successfully' })
  @ApiBody({ type: CreateAuthDto })
  @ResponseMessage('Register successfully')
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Public()
  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify Account' })
  @ApiResponse({ status: 200, description: 'Verify account successfully' })
  @ApiBody({ type: VerifyAccountDto })
  @ResponseMessage('Verify account successfully')
  verify(@Body() verifyDto: VerifyAccountDto) {
    return this.authService.verifyAccount(verifyDto);
  }

  @Public()
  @Post('resend-code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend Verification Code' })
  @ApiResponse({ status: 200, description: 'Resend code successfully' })
  @ApiBody({ type: ResendCodeDto })
  @ResponseMessage('Resend code successfully')
  resendCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.resendCode(resendCodeDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiResponse({ status: 200, description: 'Recovery account successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    },
  })
  @ResponseMessage('Recovery account successfully')
  forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }

  @Public()
  @Post('check-validcode')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check Verification Code' })
  @ApiResponse({ status: 200, description: 'Check valid code successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        code: { type: 'string' },
      },
      required: ['email', 'code'],
    },
  })
  @ResponseMessage('Check valid code successfully')
  checkValidCode(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.checkValidCode(code, email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({ status: 200, description: 'Reset password successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string' },
        token: { type: 'string' },
      },
      required: ['newPassword', 'token'],
    },
  })
  @ResponseMessage('Reset password successfully')
  resetPassword(
    @Body('newPassword') newPass: string,
    @Body('token') token: string,
  ) {
    return this.authService.resetPassword(token, newPass);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh Token' })
  @ApiResponse({ status: 200, description: 'Refresh token successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        refreshToken: { type: 'string' },
      },
      required: ['userId', 'refreshToken'],
    },
  })
  @ResponseMessage('Refresh token successfully')
  refreshToken(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.handleRefreshToken(userId, refreshToken);
  }
}
