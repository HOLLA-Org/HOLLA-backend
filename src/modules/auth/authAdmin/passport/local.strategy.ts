import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthAdminService } from '../auth.service';
import { UserType } from '../auth';
import { ROLES } from '@/constant';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'local-admin') {
  constructor(private authService: AuthAdminService) {
    super({ usernameField: 'account' });
  }

  async validate(account: string, password: string): Promise<UserType | null> {
    const user = await this.authService.validateUser(account, password);

    if (!user)
      throw new UnauthorizedException(
        'username,email or password not correct!',
      );

    if (!user.isActive)
      throw new BadRequestException('Account has not been activated!');

    if (user.role !== ROLES.admin)
      throw new UnauthorizedException('You do not have permission to access admin resources!');

    return user;
  }
}
