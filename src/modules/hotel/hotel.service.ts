import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import { Model } from 'mongoose';
import { isValidObjectId } from '@/utils';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<Hotel>,
  ) {}
  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const { name } = createHotelDto;

    // Check if hotel already exists
    const existingHotel = await this.hotelModel.findOne({ name });
    if (existingHotel) {
      throw new BadRequestException(`Hotel with name '${name}' already exists`);
    }
    const newHotel = new this.hotelModel(createHotelDto);
    return newHotel.save();
  }

  async getAllHotels() {
    return await this.hotelModel.find();
  }

  async getPopularHotels() {
    return this.hotelModel
      .find()
      .sort({ rating: -1, rating_count: -1 })
      .limit(10);
  }

  async getRecommendedHotels() {
    return this.hotelModel.aggregate([
      { $match: { rating: { $gte: 4 } } },
      { $sample: { size: 10 } },
    ]);
  }

  async getTopRatedHotels() {
    return this.hotelModel
      .find()
      .sort({ rating_count: -1, rating: -1 })
      .limit(10);
  }

  async getNewHotels() {
    return this.hotelModel.find().sort({ createdAt: -1 }).limit(10);
  }

  async findOneByName({ name }: { name: string }) {
    return await this.hotelModel.findOne({ name });
  }

  async updateHotel(
    _id: string,
    updateHotelDto: UpdateHotelDto,
  ): Promise<Hotel> {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const { name, address, description, rating, images, rating_count } =
      updateHotelDto;

    const filter = { _id };
    const update = {
      name,
      address,
      description,
      rating,
      images,
      rating_count,
    };
    const options = { new: true };

    const result = await this.hotelModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!result) {
      throw new BadRequestException(`Hotel id "${_id}" not found!`);
    }

    return result;
  }

  async remove(_id: string) {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const hasHotel = await this.hotelModel.findById(_id);

    if (!hasHotel) {
      throw new BadRequestException('Hotel not found!');
    }

    return hasHotel.deleteOne();
  }
}
