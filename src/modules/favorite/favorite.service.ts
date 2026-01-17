import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';
import { Hotel } from '@/modules/hotel/schemas/hotel.schema';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<Favorite>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<Hotel>,
  ) {}
  
  async add(userId: Types.ObjectId, hotelId: string) {
    if (!isValidObjectId(hotelId)) {
      throw new BadRequestException('Invalid hotel id');
    }

    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    try {
      await this.favoriteModel.create({
        userId,
        hotelId,
      });
    } catch {
      return { message: 'Already in favorite' };
    }

    return { message: 'Added to favorite' };
  }

  async remove(userId: Types.ObjectId, hotelId: string) {
    await this.favoriteModel.deleteOne({
      userId,
      hotelId,
    });

    return { message: 'Removed from favorite' };
  }

  async getMyFavorites(userId: Types.ObjectId) {
    const favorites = await this.favoriteModel
      .find({ userId })
      .populate({
        path: 'hotelId',
        match: { availableRooms: { $gt: 0 } },
        select: 'name rating ratingCount priceHour address images',
      })
      .sort({ createdAt: -1 })
      .lean();

    return favorites
      .filter(f => f.hotelId)
      .map(f => f.hotelId);
  }

  async getFavoriteIds(userId: Types.ObjectId) {
    return this.favoriteModel
      .find({ userId })
      .distinct('hotelId');
  }

  async isFavorite(userId: Types.ObjectId, hotelId: string): Promise<boolean> {
    return !!(await this.favoriteModel.exists({
      userId,
      hotelId,
    }));
  }
}
