import { Controller, Get, Injectable, Req } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from '@/decorator/roles.decorator';
import { ResponseMessage } from '@/decorator/customize';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  @Get('base-profile')
  @ApiOperation({ summary: 'Get basic user information' })
  @ResponseMessage('Get base profile successfully')
  async getProfile(user_id: Types.ObjectId) {
    return this.userModel.findById(user_id).select('username email').lean();
  }

  async getFullProfile(user_id: Types.ObjectId) {
    return this.userModel
      .findById(user_id)
      .select('username email phone address avatarUrl gender date_of_birth')
      .lean();
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
