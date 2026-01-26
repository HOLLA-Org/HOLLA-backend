import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.shema';
import { BookingStatus } from '@/constant';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';
import { Discount, DiscountDocument } from '../discount/schemas/discount.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,

    @InjectModel(Discount.name)
    private readonly discountModel: Model<DiscountDocument>,
    private readonly notificationService: NotificationService,
  ) { }

  async create(
    user_id: Types.ObjectId,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const { booking_id, payment_method, discount_code } = createPaymentDto;

    const user = await this.userModel.findById(user_id);
    if (!user) throw new BadRequestException('User not found');

    const booking = await this.bookingModel.findById(booking_id);
    if (!booking) throw new BadRequestException('Booking not found');

    const hotel = await this.hotelModel.findById(booking.hotel_id);
    if (!hotel) throw new BadRequestException('Hotel not found');

    if (booking.user_id.toString() !== user_id.toString()) {
      throw new BadRequestException('You do not own this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking cannot be paid with status "${booking.status}"`,
      );
    }

    const paid = await this.paymentModel.findOne({
      booking_id,
      status: 'PAID',
    });
    if (paid) {
      throw new BadRequestException('Payment already completed');
    }

    let finalAmount = booking.total_price;
    let discountId: Types.ObjectId | undefined;

    if (discount_code) {
      const discount = await this.discountModel.findOne({
        code: discount_code,
      });

      if (!discount) throw new BadRequestException('Discount not found');

      if (discount.expires_at && discount.expires_at < new Date()) {
        throw new BadRequestException('Discount expired');
      }

      const used = discount.used_by.find(
        (u) => u.user_id.toString() === user_id.toString(),
      );

      if (used && used.used_count >= discount.max_usage) {
        throw new BadRequestException(
          'Discount usage limit reached',
        );
      }

      if (used) {
        await this.discountModel.updateOne(
          { _id: discount._id, 'used_by.user_id': user_id },
          { $inc: { 'used_by.$.used_count': 1 } },
        );
      } else {
        await this.discountModel.updateOne(
          { _id: discount._id },
          { $push: { used_by: { user_id: user_id, used_count: 1 } } },
        );
      }

      const discountAmount = (booking.total_price * discount.value) / 100;
      finalAmount = Math.max(booking.total_price - discountAmount, 0);
      discountId = discount._id as Types.ObjectId;
    }

    const isInstantPayment = [
      'CREDIT',
      'ATM',
      'MOMO',
      'ZALOPAY',
      'SHOPEEPAY',
    ].includes(payment_method.toUpperCase());

    const paymentStatus: 'PAID' | 'PENDING' =
      isInstantPayment ? 'PAID' : 'PENDING';


    if (isInstantPayment) {
      const roomUpdated = await this.hotelModel.findOneAndUpdate(
        { _id: booking.hotel_id, availableRooms: { $gt: 0 } },
        { $inc: { availableRooms: -1 } },
      );

      if (!roomUpdated) {
        throw new BadRequestException('No available rooms');
      }

      const updatedBooking = await this.bookingModel.findOneAndUpdate(
        { _id: booking_id, status: BookingStatus.PENDING },
        {
          status: BookingStatus.ACTIVE,
          paid_amount: finalAmount,
        },
        { new: true },
      );

      if (!updatedBooking) {
        await this.hotelModel.findByIdAndUpdate(booking.hotel_id, {
          $inc: { availableRooms: 1 },
        });
        throw new BadRequestException('Booking already processed');
      }

      await this.notificationService.create(user_id, {
        title: 'Thanh toán thành công',
        content: `Thanh toán của bạn cho đơn đặt phòng tại ${hotel.name} đã hoàn tất.`,
        type: 'order',
      });
    }

    return this.paymentModel.create({
      user_id,
      booking_id,
      payment_method,
      discount_id: discountId,
      amount: finalAmount,
      status: paymentStatus,
    });
  }

  async getAll(): Promise<Payment[]> {
    return this.paymentModel
      .find()
      .populate('user_id', 'username email')
      .populate('booking_id')
      .populate('discount_id', 'code value');
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID "${id}" is not valid`);
    }

    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new BadRequestException('Payment not found');

    return payment.deleteOne();
  }
}
