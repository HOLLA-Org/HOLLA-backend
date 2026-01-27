import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Location, LocationDocument } from './schemas/location.schema';
import { Model } from 'mongoose';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationModel: Model<LocationDocument>,
  ) { }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { name } = createLocationDto;
    const existing = await this.locationModel.findOne({ name });
    if (existing) {
      throw new BadRequestException(`Location "${name}" already exists`);
    }
    return this.locationModel.create(createLocationDto);
  }

  async findAll() {
    return this.locationModel.find().sort({ name: 1 }).exec();
  }

  async findPopular() {
    return this.locationModel.find({ isPopular: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new BadRequestException('Location not found');
    }
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const location = await this.locationModel
      .findByIdAndUpdate(id, updateLocationDto, { new: true })
      .exec();
    if (!location) {
      throw new BadRequestException('Location not found');
    }
    return location;
  }

  async remove(id: string) {
    const location = await this.locationModel.findByIdAndDelete(id).exec();
    if (!location) {
      throw new BadRequestException('Location not found');
    }
    return location;
  }
}
