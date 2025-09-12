import {
  BadRequestException,
  Controller,
  Get,
  Injectable,
  Req,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiOperation } from '@nestjs/swagger';
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

  async updateProfile(user_id: Types.ObjectId, dto: UpdateProfileDto) {
    const updateData: Partial<UpdateProfileDto> = {};

    // Update username
    if (dto.username && dto.username.trim() !== '') {
      const existingUsername = await this.userModel.findOne({
        username: dto.username.trim(),
        _id: { $ne: user_id },
      });

      if (existingUsername) {
        throw new BadRequestException('Username is already in use');
      }
      updateData.username = dto.username.trim();
    }

    // Update email (check duplicate)
    if (dto.email && dto.email.trim() !== '') {
      const existingEmail = await this.userModel.findOne({
        email: dto.email.trim(),
        _id: { $ne: user_id },
      });

      if (existingEmail) {
        throw new BadRequestException('Email is already in use');
      }
      updateData.email = dto.email.trim();
    }

    // Update phone (check duplicate)
    if (dto.phone && dto.phone.trim() !== '') {
      const existingPhone = await this.userModel.findOne({
        phone: dto.phone.trim(),
        _id: { $ne: user_id },
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number is already in use');
      }
      updateData.phone = dto.phone.trim();
    }

    // Update address
    if (dto.address && dto.address.trim() !== '') {
      updateData.address = dto.address.trim();
    }

    // Update image
    if (dto.image && dto.image.trim() !== '') {
      updateData.image = dto.image.trim();
    }

    // Update gender
    if (dto.gender && dto.gender.trim() !== '') {
      updateData.gender = dto.gender.trim();
    }

    // Update date of birth
    if (dto.date_of_birth) {
      updateData.date_of_birth = dto.date_of_birth;
    }

    // If no valid fields provided
    if (Object.keys(updateData).length === 0) {
      return { message: 'No valid fields to update' };
    }

    await this.userModel.updateOne({ _id: user_id }, { $set: updateData });

    return {};
  }
}
