import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingDocument } from './schemas/booking.shema';
import { BookingStatus } from '@/constant';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';
import { Review, ReviewDocument } from '../review/schemas/review.schema';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { PaymentStatus } from '@/constant';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) { }

  async create({
    createBookingDto,
    user_id,
  }: {
    createBookingDto: CreateBookingDto;
    user_id: Types.ObjectId;
  }): Promise<Booking> {
    const {
      hotel_id,
      check_in,
      check_out,
      booking_type,
    } = createBookingDto;

    if (check_in >= check_out) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const user = await this.userModel.findById(user_id);
    if (!user) throw new BadRequestException('User not found');

    const hotel = await this.hotelModel.findById(hotel_id);
    if (!hotel) throw new BadRequestException('Hotel not found');

    if (hotel.availableRooms <= 0) {
      throw new BadRequestException('No available rooms');
    }

    const diffMs = check_out.getTime() - check_in.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffHours / 24);

    let totalPrice = 0;

    if (booking_type === 'per_hour') {
      if (!hotel.priceHour || hotel.priceHour <= 0) {
        throw new BadRequestException('Hotel hourly price not configured');
      }
      totalPrice = diffHours * hotel.priceHour;
    } else {
      if (!hotel.priceDay || hotel.priceDay <= 0) {
        throw new BadRequestException('Hotel daily price not configured');
      }
      totalPrice = diffDays * hotel.priceDay;
    }

    const totalBookedInPeriod = await this.bookingModel.countDocuments({
      hotel_id: hotel_id,
      status: { $in: [BookingStatus.PENDING, BookingStatus.ACTIVE] },
      check_in: { $lt: check_out },
      check_out: { $gt: check_in },
    });

    if (totalBookedInPeriod >= hotel.availableRooms) {
      throw new BadRequestException('Hotel is fully booked for this period');
    }

    const booking = await this.bookingModel.create({
      user_id: user_id,
      hotel_id: hotel_id,
      check_in,
      check_out,
      booking_type,
      total_price: totalPrice,
      status: BookingStatus.PENDING,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return booking;
  }

  async confirmBooking(id: string): Promise<Booking> {
    const bookingObjectId = new Types.ObjectId(id);

    const booking = await this.bookingModel.findById(bookingObjectId);
    if (!booking) throw new BadRequestException('Booking not found');

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not pending');
    }

    if (booking.expires_at < new Date()) {
      throw new BadRequestException('Booking expired');
    }

    const updated = await this.hotelModel.findOneAndUpdate(
      { _id: booking.hotel_id, availableRooms: { $gt: 0 } },
      { $inc: { availableRooms: -1 } },
    );

    if (!updated) throw new BadRequestException('No available rooms');

    const payment = await this.paymentModel.findOne({
      booking_id: bookingObjectId,
      status: PaymentStatus.PENDING,
    });

    if (payment) {
      booking.paid_amount = payment.amount;
      payment.status = PaymentStatus.PAID;
      await payment.save();
    }

    booking.status = BookingStatus.ACTIVE;
    return booking.save();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async completeBookings() {
    const expiredBookings = await this.bookingModel.find({
      status: BookingStatus.ACTIVE,
      check_out: { $lte: new Date() },
    });

    for (const booking of expiredBookings) {
      booking.status = BookingStatus.COMPLETED;
      await booking.save();

      // Release the room back to the hotel
      await this.hotelModel.findByIdAndUpdate(booking.hotel_id, {
        $inc: { availableRooms: 1 },
      });
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cancelExpiredPendingBookings() {
    await this.bookingModel.updateMany(
      {
        status: BookingStatus.PENDING,
        expires_at: { $lte: new Date() },
      },
      { status: BookingStatus.CANCELLED },
    );
  }

  async cancelBooking(id: string, user_id: Types.ObjectId): Promise<Booking> {
    const bookingObjectId = new Types.ObjectId(id);

    const booking = await this.bookingModel.findById(bookingObjectId);
    if (!booking) throw new BadRequestException('Booking not found');

    if (!booking.user_id.equals(user_id)) {
      throw new BadRequestException('Not owner');
    }

    if (![BookingStatus.PENDING, BookingStatus.ACTIVE].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel');
    }

    if (booking.status === BookingStatus.ACTIVE) {
      await this.hotelModel.findByIdAndUpdate(booking.hotel_id, {
        $inc: { availableRooms: 1 },
      });
    }

    booking.status = BookingStatus.CANCELLED;
    return booking.save();
  }

  async adminCancelBooking(id: string): Promise<Booking> {
    const bookingObjectId = new Types.ObjectId(id);

    const booking = await this.bookingModel.findById(bookingObjectId);
    if (!booking) throw new BadRequestException('Booking not found');

    if (![BookingStatus.PENDING, BookingStatus.ACTIVE].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel');
    }

    if (booking.status === BookingStatus.ACTIVE) {
      await this.hotelModel.findByIdAndUpdate(booking.hotel_id, {
        $inc: { availableRooms: 1 },
      });
    }

    booking.status = BookingStatus.CANCELLED;
    return booking.save();
  }

  async getAll(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .sort({ booked_at: -1 })
      .populate('user_id', 'username email')
      .populate('hotel_id', 'name address rating images');
  }

  async getAllByStatus(user_id: Types.ObjectId, status: BookingStatus) {
    return this.bookingModel
      .find({ user_id: user_id, status })
      .sort({ booked_at: -1 })
      .populate('hotel_id', 'name address rating images');
  }

  async getBookingHistory(user_id: Types.ObjectId, status: BookingStatus) {
    if (!Object.values(BookingStatus).includes(status)) {
      throw new BadRequestException('Invalid booking status');
    }

    const bookings = await this.bookingModel
      .find({ user_id: user_id, status })
      .populate('hotel_id')
      .sort({ booked_at: -1 })
      .lean();

    const bookingIds = bookings.map(b => b._id);
    const reviews = await this.reviewModel.find({
      booking_id: { $in: bookingIds },
      user_id: user_id,
    });

    const payments = await this.paymentModel.find({
      booking_id: { $in: bookingIds },
    });
    const paymentMap = new Map(payments.map(p => [p.booking_id.toString(), p.amount]));

    const reviewedBookingIds = new Set(reviews.map(r => r.booking_id.toString()));

    return bookings
      .filter(b => b.hotel_id)
      .map(b => {
        const hotel = b.hotel_id as any;
        return {
          ...hotel,
          bookingId: b._id,
          bookingStatus: b.status,
          check_in: b.check_in,
          check_out: b.check_out,
          price: b.paid_amount ?? paymentMap.get(b._id.toString()) ?? b.total_price,
          isReviewed: reviewedBookingIds.has(b._id.toString()),
        };
      });
  }
}
