import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from './schemas/hotel.schema';
import { Model, Types } from 'mongoose';
import { isValidObjectId } from '@/utils';
import { MediaService } from '../media/media.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<Hotel>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const { name } = createHotelDto;

    const existingHotel = await this.hotelModel.findOne({ name });
    if (existingHotel) {
      throw new BadRequestException(
        `Hotel with name "${name}" already exists`,
      );
    }

    return this.hotelModel.create(createHotelDto);
  }

  async getAllHotels() {
    return this.hotelModel.find();
  }

  async getPopularHotels() {
    return this.hotelModel
      .find({
        isPopular: true,
        availableRooms: { $gt: 0 },
      })
      .limit(10);
  }

  async getRecommendedHotelsNearUser(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId).lean();

    if (!user?.latitude || !user?.longitude) {
      throw new BadRequestException('User location not found');
    }

    const { latitude, longitude } = user;

    return this.hotelModel.aggregate([
      {
        $match: {
          availableRooms: { $gt: 0 },
          latitude: { $ne: null },
          longitude: { $ne: null },
        },
      },
      {
        $addFields: {
          distance: {
            $let: {
              vars: {
                lat1: { $degreesToRadians: latitude },
                lon1: { $degreesToRadians: longitude },
                lat2: { $degreesToRadians: '$latitude' },
                lon2: { $degreesToRadians: '$longitude' },
              },
              in: {
                $multiply: [
                  6371000,
                  {
                    $acos: {
                      $min: [
                        1,
                        {
                          $add: [
                            {
                              $multiply: [
                                { $sin: '$$lat1' },
                                { $sin: '$$lat2' },
                              ],
                            },
                            {
                              $multiply: [
                                { $cos: '$$lat1' },
                                { $cos: '$$lat2' },
                                {
                                  $cos: {
                                    $subtract: ['$$lon2', '$$lon1'],
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { distance: 1 } },
      { $limit: 5 },
    ]);
  }

  async getTopRatedHotels() {
    return this.hotelModel
      .find({
        availableRooms: { $gt: 0 },
      })
      .sort({ ratingCount: -1, rating: -1 })
      .limit(10);
  }
  
  async findOneByName({ name }: { name: string }) {
    const hotel = await this.hotelModel.findOne({ name });

    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }
    return hotel;
  }

  async searchByName(name: string) {
    return this.hotelModel.find({
      name: { $regex: name, $options: 'i' },
      availableRooms: { $gt: 0 },
    });
  }

  async updateHotel(
    id: string,
    updateHotelDto: UpdateHotelDto,
  ): Promise<Hotel> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID "${id}" is not valid`);
    }

    const hotel = await this.hotelModel.findByIdAndUpdate(
      id,
      { $set: updateHotelDto },
      { new: true },
    );

    if (!hotel) {
      throw new BadRequestException(`Hotel id "${id}" not found`);
    }

    return hotel;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID "${id}" is not valid`);
    }

    const hotel = await this.hotelModel.findById(id);
    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }

    return hotel.deleteOne();
  }
}
