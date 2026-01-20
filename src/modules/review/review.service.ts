import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.shema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';
import { BookingStatus } from '@/constant';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,
  ) {}

  async create(
    user_id: Types.ObjectId,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { booking_id, rating, comment } = createReviewDto;

    const booking = await this.bookingModel.findOne({
      _id: booking_id,
      user_id,
      status: BookingStatus.COMPLETED,
    });

    if (!booking) {
      throw new BadRequestException('Booking not found or not completed');
    }

    let review: Review;
    try {
      review = await this.reviewModel.create({
        user_id: user_id,
        hotel_id: booking.hotel_id,
        booking_id,
        rating,
        comment,
      });
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException(
          'You already reviewed this booking',
        );
      }
      throw e;
    }

    await this.hotelModel.findByIdAndUpdate(booking.hotel_id, [
      {
        $set: {
          ratingCount: { $add: ['$ratingCount', 1] },
          rating: {
            $divide: [
              {
                $add: [
                  { $multiply: ['$rating', '$ratingCount'] },
                  rating,
                ],
              },
              { $add: ['$ratingCount', 1] },
            ],
          },
        },
      },
    ]);

    return review;
  }

  async findAllByHotel(
    hotel_id: Types.ObjectId,
    user_id: Types.ObjectId,
  ): Promise<Review[]> {
    return this.reviewModel.aggregate([
      {
        $match: {
          hotel_id: hotel_id,
        },
      },
      {
        $addFields: {
          isMine: {
            $eq: ['$user_id', user_id],
          },
        },
      },
      {
        $sort: {
          isMine: -1,
          review_date: -1,
        },
      },
      {
        $project: {
          isMine: 0,
        },
      },
    ]);
  }
}
