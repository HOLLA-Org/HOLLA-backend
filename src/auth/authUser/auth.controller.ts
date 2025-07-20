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
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  @ResponseMessage('Login successfully')
  async handleLogin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }
}
