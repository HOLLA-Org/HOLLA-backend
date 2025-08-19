import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import { Model } from 'mongoose';

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
  async findOneByName({ name }: { name: string }) {
    return await this.hotelModel.findOne({ name });
  }

  update(id: number, updateHotelDto: UpdateHotelDto) {
    return `This action updates a #${id} hotel`;
  }

  remove(id: number) {
    return `This action removes a #${id} hotel`;
  }
}
