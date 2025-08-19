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
@Controller('hotel')
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

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiResponse({ status: 200, description: 'Get all hotels successfully' })
  @ApiResponse({ status: 404, description: 'No hotels found' })
  @ResponseMessage('Get all hotels successfully')
  async getAllHotels() {
    return this.hotelService.getAllHotels();
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular hotels (high rating + many reviews)' })
  @ApiResponse({ status: 200, description: 'List of popular hotels' })
  @ApiResponse({ status: 404, description: 'No popular hotels found' })
  @ResponseMessage('Popular hotels fetched successfully')
  async getPopular() {
    return this.hotelService.getPopularHotels();
  }

  @Get('recommended')
  @Public()
  @ApiOperation({ summary: 'Get recommended hotels' })
  @ApiResponse({ status: 200, description: 'List of recommended hotels' })
  @ApiResponse({ status: 404, description: 'No recommended hotels found' })
  @ResponseMessage('Recommended hotels fetched successfully')
  async getRecommended() {
    return this.hotelService.getRecommendedHotels();
  }

  @Get('top-rated')
  @Public()
  @ApiOperation({
    summary: 'Get top-rated hotels sorted by rating/rating_count',
  })
  @ApiResponse({ status: 200, description: 'List of top-rated hotels' })
  @ApiResponse({ status: 404, description: 'No top-rated hotels found' })
  @ResponseMessage('Top-rated hotels fetched successfully')
  async getTopRated() {
    return this.hotelService.getTopRatedHotels();
  }

  @Get('new')
  @Public()
  @ApiOperation({
    summary: 'Get newly added hotels (sorted by createdAt desc)',
  })
  @ApiResponse({ status: 200, description: 'List of new hotels' })
  @ApiResponse({ status: 404, description: 'No new hotels found' })
  @ResponseMessage('New hotels fetched successfully')
  async getNew() {
    return this.hotelService.getNewHotels();
  }

  @Get(':name')
  @Public()
  @ApiOperation({ summary: 'Find a hotel by username' })
  @ApiResponse({ status: 200, description: 'Get hotel info by username' })
  @ApiResponse({ status: 404, description: 'No hotel found' })
  @ApiParam({ name: 'name', description: 'Name of the hotel' })
  @ResponseMessage('Get hotel info by username')
  async findByName(@Param('name') name: string) {
    return this.hotelService.findOneByName({ name });
  }

  @Patch(':id')
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: 'Update hotel by id' })
  @ApiResponse({ status: 200, description: 'HOtel updated successfully' })
  @ResponseMessage('Update hotel successfully')
  @ApiBody({ type: UpdateHotelDto })
  async update(
    @Param('id') _id: string,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    return this.hotelService.updateHotel(_id, updateHotelDto);
  }
}
