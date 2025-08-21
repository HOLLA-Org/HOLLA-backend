import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.shema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';
import { BookingStatus } from '@/constant';
import { Room } from '../room/schemas/room.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
  ) {}
  async create(
    user_id: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { booking_id } = createReviewDto;

    const booking = await this.bookingModel.findOne({
      _id: booking_id,
      user_id,
    });
    if (!booking) {
      throw new BadRequestException(`Booking not found for this user`);
    }

    const room = await this.roomModel.findById(booking.room_id);
    if (!room) {
      throw new BadRequestException(`Room not found for booking`);
    }

    const hotel = await this.hotelModel.findById(room.hotel_id);
    if (!hotel) {
      throw new BadRequestException(`Hotel not found for room`);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(`Booking is not completed, cannot review`);
    }

    const existingReview = await this.reviewModel.findOne({
      user_id,
      booking_id,
    });
    if (existingReview) {
      throw new BadRequestException(`You already reviewed this booking`);
    }

    const newReview = new this.reviewModel({
      user_id,
      hotel_id: hotel._id,
      booking_id,
      ...createReviewDto,
    });

    return newReview.save();
  }
}
