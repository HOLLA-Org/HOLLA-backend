import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingDocument } from './schemas/booking.shema';
import { BookingStatus } from '@/constant';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../room/schemas/room.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { user_id, room_id, check_in, check_out } = createBookingDto;

    const existingUser = await this.userModel.findById(user_id);
    if (!existingUser) {
      throw new BadRequestException(`Not found user with id ${user_id}`);
    }

    const existingRoom = await this.roomModel.findById(room_id);
    if (!existingRoom) {
      throw new BadRequestException(`Not found room with id ${room_id}`);
    }

    const existingBooking = await this.bookingModel
      .findOne({
        room_id,
        status: { $ne: BookingStatus.CANCELLED },
        $or: [
          { check_in: { $lt: check_out, $gte: check_in } },
          { check_out: { $gt: check_in, $lte: check_out } },
        ],
      })
      .exec();

    if (existingBooking) {
      throw new BadRequestException(
        'This room is already booked for the selected time range.',
      );
    }

    const newBooking = new this.bookingModel(createBookingDto);
    return newBooking.save();
  }

  async confirmBooking(_id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(_id);
    if (!booking) {
      throw new BadRequestException(`Not found booking with id ${_id}`);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking is not in a pending state. Current status: ${booking.status}`,
      );
    }

    booking.status = BookingStatus.ACTIVE;
    await booking.save();

    if (booking.room_id) {
      await this.roomModel.findByIdAndUpdate(booking.room_id, {
        is_available: false,
      });
    }
    return booking;
  }

  async getAll(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .sort({ booked_at: -1 })
      .populate('user_id', 'username email')
      .populate('room_id', 'name type');
  }

  async getAllByStatus(
    user_id: string,
    status: BookingStatus,
  ): Promise<Booking[]> {
    return this.bookingModel
      .find({
        user_id: user_id,
        status: status,
      })
      .populate('room_id');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async changeStatusBookings() {
    const findConditions = {
      status: BookingStatus.ACTIVE,
      check_out: { $lte: new Date() },
    };

    const updateData = {
      status: BookingStatus.COMPLETED,
    };

    return await this.bookingModel.updateMany(findConditions, updateData);
  }
}
