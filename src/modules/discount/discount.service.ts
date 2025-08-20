import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount, DiscountDocument } from './schemas/discount.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const discount = await this.discountModel.findOne({
      code: createDiscountDto.code,
    });
    if (discount) {
      throw new Error('Discount already exists');
    }
    const newDiscount = new this.discountModel(createDiscountDto);
    return newDiscount.save();
  }

  findAll() {
    return `This action returns all discount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discount`;
  }

  update(id: number, updateDiscountDto: UpdateDiscountDto) {
    return `This action updates a #${id} discount`;
  }

  remove(id: number) {
    return `This action removes a #${id} discount`;
  }
}
