import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async create(
    user_id: Types.ObjectId,
    dto: CreateNotificationDto,
  ) {
    return this.notificationModel.create({
      user_id,
      title: dto.title,
      content: dto.content,
      type: dto.type ?? 'system',
    });
  }

  async findAll(user_id: Types.ObjectId) {
    return this.notificationModel
      .find({ user_id, is_deleted: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(
    user_id: Types.ObjectId,
    id: Types.ObjectId,
  ) {
    const notification = await this.notificationModel.findOne({
      _id: id,
      user_id,
      is_deleted: false,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(
    user_id: Types.ObjectId,
    id: Types.ObjectId,
    dto: UpdateNotificationDto,
  ) {
    const notification =
      await this.notificationModel.findOneAndUpdate(
        { _id: id, user_id, is_deleted: false },
        { $set: dto },
        { new: true },
      );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(user_id: Types.ObjectId) {
    await this.notificationModel.updateMany(
      {
        user_id,
        is_deleted: false,
        is_read: false,
      },
      {
        $set: { is_read: true },
      },
    );

    return { message: 'All notifications marked as read' };
  }

  async remove(
    user_id: Types.ObjectId,
    id: Types.ObjectId,
  ) {
    const notification =
      await this.notificationModel.findOneAndUpdate(
        { _id: id, user_id, is_deleted: false },
        { $set: { is_deleted: true } },
      );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async removeAll(user_id: Types.ObjectId) {
    await this.notificationModel.updateMany(
      {
        user_id,
        is_deleted: false,
      },
      {
        $set: { is_deleted: true },
      },
    );

    return { message: 'All notifications deleted successfully' };
  }
}
