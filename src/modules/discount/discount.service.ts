import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount, DiscountDocument } from './schemas/discount.schema';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const discount = await this.discountModel.findOne({
      code: createDiscountDto.code,
    });
    if (discount) {
      throw new BadRequestException('Discount already exists');
    }
    const newDiscount = new this.discountModel(createDiscountDto);
    return newDiscount.save();
  }
  async applyDiscount(
    code: string,
    user_id: string,
  ): Promise<{ value: number }> {
    const existingUser = await this.userModel.findById(user_id);
    if (!existingUser) {
      throw new BadRequestException(`User with id ${user_id} not found`);
    }

    const discount = await this.discountModel.findOne({ code });
    if (!discount) {
      throw new BadRequestException('Discount not found');
    }

    if (discount.expires_at && discount.expires_at < new Date()) {
      throw new BadRequestException('Discount expired');
    }

    const used = discount.used_by.find((u) => u.user_id.toString() === user_id);

    if (used) {
      if (used.used_count >= discount.max_usage) {
        throw new BadRequestException(
          'Discount usage limit reached for this user',
        );
      }

      await this.discountModel.updateOne(
        { _id: discount._id, 'used_by.user_id': user_id },
        { $inc: { 'used_by.$.used_count': 1 } },
      );
    } else {
      await this.discountModel.updateOne(
        { _id: discount._id },
        {
          $push: {
            used_by: { user_id, used_count: 1 },
          },
        },
      );
    }

    return { value: discount.value };
  }
  async getAll(): Promise<Discount[]> {
    return this.discountModel.find();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredDiscounts() {
    const findConditions = {
      expires_at: { $lte: new Date() },
    };

    return await this.discountModel.deleteMany(findConditions);
  }

  async remove(_id: string) {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const hasDiscount = await this.discountModel.findById(_id);

    if (!hasDiscount) {
      throw new BadRequestException('Discount not found!');
    }

    return hasDiscount.deleteOne();
  }
}
