import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Role, Roles } from '@/decorator/roles.decorator';
import { Public, ResponseMessage } from '@/decorator/customize';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Hotels')
// @ApiBearerAuth()
@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully' })
  @ApiBody({ type: CreateHotelDto })
  @ResponseMessage('Create new hotel successfully')
  async createHotel(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }
}
