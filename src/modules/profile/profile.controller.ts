import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, Roles } from '@/decorator/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/decorator/customize';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@ApiBearerAuth()
@ApiTags('Profile')
@Roles(Role.User)
@Controller('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('base-profile')
  @ApiOperation({ summary: 'Get basic user information' })
  @ResponseMessage('Get base profile successfully')
  async getProfile(@Request() req: RequestWithUser) {
    const user_id = req.user._id;
    return this.profileService.getProfile(user_id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get full user information' })
  @ResponseMessage('Get profile successfully')
  async getFullProfile(@Request() req: RequestWithUser) {
    const user_id = req.user._id;
    return this.profileService.getFullProfile(user_id);
  }

  @Patch('update-profile')
  @ApiOperation({ summary: 'Update user information' })
  @ApiBody({ type: UpdateProfileDto })
  @ResponseMessage('Update profile successfully')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user_id = req.user._id;
    return this.profileService.updateProfile(user_id, dto);
  }
}
