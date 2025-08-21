import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.shema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
  ) {}
  async create(user_id: string, createReviewDto: CreateReviewDto) {
    const { booking_id, hotel_id, rating, comment } = createReviewDto;

    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new BadRequestException(`User with id not found`);
    }

    const booking = await this.bookingModel.findById(booking_id);
    if (!booking) {
      throw new BadRequestException(`Booking with id not found`);
    }

    const hotel = await this.hotelModel.findById(hotel_id);
    if (!hotel) {
      throw new BadRequestException(`Hotel with id not found`);
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
      hotel_id,
      booking_id,
      rating,
      comment,
      review_date: new Date(),
    });

    return newReview.save();
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
