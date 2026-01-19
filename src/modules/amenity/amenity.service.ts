import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Amenity } from './schemas/amenity.schema';
import { Model } from 'mongoose';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenityService {
  constructor(
    @InjectModel(Amenity.name)
    private readonly amenityModel: Model<Amenity>,
  ) {}

  async create(dto: CreateAmenityDto) {
    const exists = await this.amenityModel.findOne({
      name: dto.name.trim(),
    });

    if (exists) {
      throw new BadRequestException('Amenity already exists');
    }

    return this.amenityModel.create({
      name: dto.name.trim(),
      icon: dto.icon,
    });
  }

  async findAll() {
    return this.amenityModel
      .find({ isActive: true })
      .select('name icon')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id: string) {
    const amenity = await this.amenityModel.findById(id);
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    return amenity;
  }

  async update(id: string, dto: UpdateAmenityDto) {
    const amenity = await this.findById(id);

    if (dto.name) {
      const exists = await this.amenityModel.findOne({
        name: dto.name.trim(),
        _id: { $ne: id },
      });

      if (exists) {
        throw new BadRequestException('Amenity name already exists');
      }

      amenity.name = dto.name.trim();
    }

    if (dto.icon !== undefined) {
      amenity.icon = dto.icon;
    }

    await amenity.save();
    return amenity;
  }

  async remove(id: string) {
    const amenity = await this.findById(id);
    amenity.isActive = false;
    await amenity.save();

    return {
      message: 'Amenity deleted successfully',
    };
  }
}
