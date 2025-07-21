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
}
