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

  async getAllHotels(userId?: Types.ObjectId) {
    return this.hotelModel.aggregate([
      {
        $match: {
          availableRooms: { $gt: 0 },
        },
      },
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);
  }

  async getPopularHotels(userId?: Types.ObjectId) {
    return this.hotelModel.aggregate([
      {
        $match: {
          isPopular: true,
          availableRooms: { $gt: 0 },
        },
      },
      { $limit: 10 },
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);
  }

  async getHotelById(hotelId: string, userId?: Types.ObjectId) {
    if (!isValidObjectId(hotelId)) {
      throw new BadRequestException(`ID "${hotelId}" is not valid`);
    }

    const result = await this.hotelModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(hotelId),
        },
      },
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);

    if (!result || result.length === 0) {
      throw new BadRequestException('Hotel not found');
    }

    return result[0];
  }

  async getRecommendedHotelsNearUser(userId?: Types.ObjectId) {
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
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);
  }

  async getTopRatedHotels(userId?: Types.ObjectId) {
    return this.hotelModel.aggregate([
      {
        $match: {
          availableRooms: { $gt: 0 },
        },
      },
      { $sort: { ratingCount: -1, rating: -1 } },
      { $limit: 10 },
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);
  }
  
  async findOneByName({ name }: { name: string }) {
    const hotel = await this.hotelModel.findOne({ name });

    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }
    return hotel;
  }

  async searchByName(name: string, userId?: Types.ObjectId) {
    return this.hotelModel.aggregate([
      {
        $match: {
          name: { $regex: name, $options: 'i' },
          availableRooms: { $gt: 0 },
        },
      },
      ...this.amenityLookupPipeline(),
      ...this.favoriteLookupPipeline(userId?.toString()),
    ]);
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

  private favoriteLookupPipeline(userId?: string) {
    if (!userId) {
      return [
        {
          $addFields: {
            isFavorite: false,
          },
        },
      ];
    }
    return [
      {
        $lookup: {
          from: 'favorites',
          let: {
            hotelId: '$_id',
            userId: userId,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        { $toString: '$hotelId' },
                        { $toString: '$$hotelId' },
                      ],
                    },
                    {
                      $eq: [{ $toString: '$userId' }, '$$userId'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'favorite',
        },
      },
      {
        $addFields: {
          isFavorite: { $gt: [{ $size: '$favorite' }, 0] },
        },
      },
      {
        $project: { favorite: 0 },
      },
    ];
  }

  private amenityLookupPipeline() {
  return [
    {
      $addFields: {
        amenities: {
          $map: {
            input: '$amenities',
            as: 'amenityId',
            in: { $toObjectId: '$$amenityId' },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'amenities',
        localField: 'amenities',
        foreignField: '_id',
        as: 'amenities',
      },
    },
    {
      $project: {
        'amenities.isActive': 0,
        'amenities.createdAt': 0,
        'amenities.updatedAt': 0,
      },
    },
  ];
}
}
