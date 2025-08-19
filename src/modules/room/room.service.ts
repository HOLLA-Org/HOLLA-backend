import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';
import { getInfo } from '@/utils';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(Hotel.name) private readonly hotelModel: Model<Hotel>,
  ) {}
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const { hotel_id, name } = createRoomDto;

    const existingHotel = await this.hotelModel.findById(hotel_id);
    if (!existingHotel) {
      throw new BadRequestException(`Not found hotel with id ${hotel_id}`);
    }

    const existingRoom = await this.roomModel.findOne({ name });
    if (existingRoom) {
      throw new BadRequestException(`Room with name '${name}' already exists`);
    }
    const newRoom = new this.roomModel(createRoomDto);
    return newRoom.save();
  }

  async getAllByHotelId(hotel_id: string): Promise<Room[]> {
    const hotel = await this.hotelModel.findById(hotel_id);
    if (!hotel) {
      throw new BadRequestException(`Hotel with ID "${hotel_id}" not found`);
    }

    const rooms = await this.roomModel.find({ hotel_id });
    return rooms;
  }

  async updateRoom(_id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const {
      name,
      type,
      price_per_hour,
      price_overnight,
      price_per_day,
      is_available,
      images,
    } = updateRoomDto;

    const filter = { _id };
    const update = {
      name,
      type,
      price_per_hour,
      price_overnight,
      price_per_day,
      is_available,
      images,
    };
    const options = { new: true };

    const result = await this.roomModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!result) {
      throw new BadRequestException(`Room id "${_id}" not found!`);
    }

    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
