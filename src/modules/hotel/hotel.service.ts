import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import { Model, Types } from 'mongoose';
import { isValidObjectId } from '@/utils';
import { UploadApiOptions } from 'cloudinary';
import { MediaService } from '../media/media.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<Hotel>,
    private readonly mediaService: MediaService,
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

  // async addPhotos(
  //   hotelId: string,
  //   files: Express.Multer.File[],
  // ): Promise<HotelDocument> {
  //   if (!isValidObjectId(hotelId)) {
  //     throw new BadRequestException(`ID "${hotelId}" is not valid!`);
  //   }
  //   const hotel = await this.hotelModel.findById(hotelId);
  //   if (!hotel) {
  //     throw new BadRequestException('Hotel not found');
  //   }

  //   // Dùng Promise.all để upload nhiều file song song cho hiệu quả
  //   const uploadPromises = files.map((file) => {
  //     // Chuẩn bị tùy chọn upload cho ảnh khách sạn
  //     const uploadOptions: UploadApiOptions = {
  //       folder: `hotels/${hotelId}`,
  //       transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
  //     };
  //     // Gọi hàm uploadAndSave từ MediaService
  //     return this.mediaService.uploadAndSave(file, uploadOptions, {
  //       hotel_id: new Types.ObjectId(hotelId),
  //     });
  //   });

  //   const newMediaDocs = await Promise.all(uploadPromises);

  //   // Lấy _id từ các media document vừa tạo và thêm vào hotel
  //   hotel.images.push(...newMediaDocs.map((doc) => doc._id));

  //   return hotel.save();
  // }
}
