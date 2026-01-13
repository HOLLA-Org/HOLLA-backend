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
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { Role, Roles } from '@/decorator/roles.decorator';
import { ResponseMessage } from '@/decorator/customize';

@ApiBearerAuth()
@ApiTags('Notification')
@Roles(Role.User)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @ResponseMessage('Create notification successfully')
  create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(req.user._id, dto);
  }

  @Get()
  @ResponseMessage('Get all notifications successfully')
  findAll(@Request() req: RequestWithUser) {
    return this.notificationService.findAll(req.user._id);
  }

  @Patch(':id/mark-read')
  @ResponseMessage('Mark notification as read successfully')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(
      req.user._id,
      new Types.ObjectId(id),
      dto,
    );
  }

  @Patch('mark-all-read')
  @ResponseMessage('Mark all notifications as read successfully')
  markAllAsRead(
    @Request() req: RequestWithUser,
  ) {
    return this.notificationService.markAllAsRead(req.user._id);
  }

  @Delete('remove-all')
  @ResponseMessage('Delete all notifications successfully')
  removeAll(@Request() req: RequestWithUser) {
    return this.notificationService.removeAll(req.user._id);
  }

  @Delete(':id')
  @ResponseMessage('Delete notification successfully')
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.notificationService.remove(
      req.user._id,
      new Types.ObjectId(id),
    );
  }
}
