import { ROLES } from '@/constant';
import { Role, ROLES_KEY } from '@/decorator/roles.decorator';
import { User } from '@/modules/users/schemas/user.schema';
import { UsersService } from '@/modules/users/users.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userId = user?._id;

    const hasUser = await this.usersService.findById(userId);

    const isTrue = requiredRoles.some((role, index) => {
      return hasUser.role === ROLES[requiredRoles[index]];
    });

    return isTrue;
  }
}
