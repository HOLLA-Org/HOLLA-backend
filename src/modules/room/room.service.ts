import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { Hotel, HotelDocument } from '../hotel/schemas/hotel.schema';

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

  findAll() {
    return `This action returns all room`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
