import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role, Roles } from '@/decorator/roles.decorator';

@ApiBearerAuth()
@ApiTags('Hotels')
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiBody({ type: CreateHotelDto })
  @ResponseMessage('Create new hotel successfully')
  create(@Body() dto: CreateHotelDto) {
    return this.hotelService.create(dto);
  }

  @Get()
  @Public()
  // @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Get all hotels' })
  @ResponseMessage('Get all hotels successfully')
  getAll() {
    return this.hotelService.getAllHotels();
  }

  @Get('popular')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get popular hotels' })
  @ResponseMessage('Popular hotels fetched successfully')
  getPopular(@Request() req: RequestWithUser) {
  return this.hotelService.getPopularHotels(req.user._id);
}

  @Get('recommended')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get recommended hotels' })
  @ResponseMessage('Recommended hotels fetched successfully')
  getRecommended(@Request() req: RequestWithUser) {
    return this.hotelService.getRecommendedHotelsNearUser(req.user._id);
  }

  @Get('top-rated')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get top-rated hotels' })
  @ResponseMessage('Top-rated hotels fetched successfully')
  getTopRated(@Request() req: RequestWithUser) {
    return this.hotelService.getTopRatedHotels(req.user._id);
  }

  @Get('search')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Search hotels by name' })
  @ResponseMessage('Search hotels by name successfully')
  search(@Query('name') name: string, @Request() req: RequestWithUser) {
    return this.hotelService.searchByName(name, req.user._id);
  }

  @Get('by-name/:name')
  @Public()
  @ApiOperation({ summary: 'Find hotel by name' })
  @ApiParam({ name: 'name', description: 'Hotel name' })
  @ResponseMessage('Get hotel info by name')
  findByName(@Param('name') name: string) {
    return this.hotelService.findOneByName({ name });
  }

  @Get('detail/:id')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get hotel details by ID' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ResponseMessage('Get hotel details successfully')
  getHotelById(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.hotelService.getHotelById(id, req.user._id);
  }
  

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update hotel by id' })
  @ApiBody({ type: UpdateHotelDto })
  @ResponseMessage('Update hotel successfully')
  update(@Param('id') id: string, @Body() dto: UpdateHotelDto) {
    return this.hotelService.updateHotel(id, dto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete hotel by id' })
  @ResponseMessage('Delete hotel successfully')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
