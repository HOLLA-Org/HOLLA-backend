import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseMessage } from '@/decorator/customize';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { Role, Roles } from '@/decorator/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
@ApiBearerAuth()
@ApiTags('Profile')
@Roles(Role.User)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
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

  @Patch('update-avatar')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Update avatar successfully')
  async updateAvatar(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user_id = req.user._id;
    return this.profileService.updateAvatar(user_id, file);
  }
  

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ResponseMessage('Change password successfully')
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const user_id = req.user._id;
    return this.profileService.changePassword(user_id, dto);
  }
}
