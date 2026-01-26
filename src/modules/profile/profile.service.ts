import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { MediaService } from '../media/media.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from '@/helpers';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mediaService: MediaService,
    private readonly notificationService: NotificationService,
  ) { }

  async getFullProfile(user_id: Types.ObjectId) {
    return this.userModel
      .findById(user_id)
      .select('username email phone address latitude longitude avatarUrl gender date_of_birth')
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

    if (
      typeof dto.latitude === 'number' &&
      typeof dto.longitude === 'number'
    ) {
      updateData.latitude = dto.latitude;
      updateData.longitude = dto.longitude;
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

  async updateAvatar(
    user_id: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarUrl = await this.mediaService.uploadImage(file, {
      folder: `users/${user_id}/avatars`,
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' },
      ],
    });

    user.avatarUrl = avatarUrl;
    await user.save();

    return {
      message: 'Update avatar successfully',
      data: {
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async changePassword(
    user_id: Types.ObjectId,
    dto: ChangePasswordDto,
  ) {
    const user = await this.userModel.findById(user_id).select('password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, new_password } = dto;

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await comparePassword(new_password, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const hashedPassword = await hashPassword(new_password);

    user.password = hashedPassword;
    await user.save();

    await this.notificationService.create(user_id, {
      title: 'Mật khẩu đã được thay đổi',
      content: 'Bạn đã thay đổi mật khẩu thành công.',
      type: 'system',
    });

    return {
      message: 'Change password successfully',
    };
  }
}
