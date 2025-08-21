import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.shema';
import { isValidObjectId, Model } from 'mongoose';
import { DiscountService } from '../discount/discount.service';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../room/schemas/room.schema';
import { BookingStatus } from '@/constant';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly discountService: DiscountService,
  ) {}

  async create(
    user_id: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const { booking_id, payment_method, discount_code } = createPaymentDto;

    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new BadRequestException('User not found with id');
    }

    const booking = await this.bookingModel.findById(booking_id);
    if (!booking) {
      throw new BadRequestException('Booking not found with id');
    }

    const existingPayment = await this.paymentModel.findOne({
      booking_id,
      booking_status: 'Paid',
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for booking');
    }

    if (booking.status === BookingStatus.ACTIVE) {
      throw new BadRequestException(
        'Booking is already active and cannot be paid again',
      );
    }

    let discountValue = 0;
    if (discount_code) {
      const { value } = await this.discountService.applyDiscount(
        discount_code,
        user_id,
      );
      discountValue = value;
    }

    let finalAmount = booking.total_price * (1 - discountValue / 100);
    if (finalAmount < 0) finalAmount = 0;

    let booking_status = 'Pending';
    if (
      ['CREDIT', 'ATM', 'MOMO', 'ZALOPAY', 'SHOPEEPAY'].includes(
        payment_method.toUpperCase(),
      )
    ) {
      booking_status = 'Paid';
      booking.status = BookingStatus.ACTIVE;

      if (booking.room_id) {
        await this.roomModel.findByIdAndUpdate(booking.room_id, {
          is_available: false,
        });
      }

      await booking.save();
    }

    const payment = new this.paymentModel({
      user_id,
      booking_id,
      discount_id: discount_code || null,
      payment_method,
      booking_status,
      amount: finalAmount,
    });

    return payment.save();
  }

  async getdAll(): Promise<Payment[]> {
    return this.paymentModel.find();
  }

  async remove(_id: string) {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const hasPayment = await this.paymentModel.findById(_id);

    if (!hasPayment) {
      throw new BadRequestException('Payment not found!');
    }

    return hasPayment.deleteOne();
  }
}
