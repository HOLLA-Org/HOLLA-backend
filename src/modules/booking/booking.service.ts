import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingDocument } from './schemas/booking.shema';
import { BookingStatus } from '@/constant';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../room/schemas/room.schema';

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
      throw new BadRequestException(`Not found room with id ${user_id}`);
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
  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
