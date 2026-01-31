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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@/config/upload.config';
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
  ApiConsumes,
} from '@nestjs/swagger';
import { Role, Roles } from '@/decorator/roles.decorator';

@ApiBearerAuth()
@ApiTags('Hotels')
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: '[Admin] Create a new hotel' })
  @ApiBody({ type: CreateHotelDto })
  @ResponseMessage('Create new hotel successfully')
  create(@Body() dto: CreateHotelDto) {
    return this.hotelService.create(dto);
  }

  @Get()
  @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Get all hotels' })
  @ResponseMessage('Get all hotels successfully')
  getAll(@Request() req: RequestWithUser) {
    return this.hotelService.getAllHotels(req.user);
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
  @ApiOperation({ summary: '[Admin] Update hotel by id' })
  @ApiBody({ type: UpdateHotelDto })
  @ResponseMessage('Update hotel successfully')
  update(@Param('id') id: string, @Body() dto: UpdateHotelDto) {
    return this.hotelService.updateHotel(id, dto);
  }

  @Post(':id/amenities')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Add multiple amenities to hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amenityIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['66c9f4c1a8e123456789abcd', '66c9f4c1a8e123456789abce'],
        },
      },
    },
  })
  @ResponseMessage('Add amenities to hotel successfully')
  addAmenities(
    @Param('id') id: string,
    @Body('amenityIds') amenityIds: string[],
  ) {
    return this.hotelService.addAmenitiesToHotel(id, amenityIds);
  }

  @Delete(':id/amenities/:amenityId')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Remove amenity from hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiParam({ name: 'amenityId', description: 'Amenity ID' })
  @ResponseMessage('Remove amenity from hotel successfully')
  removeAmenity(
    @Param('id') id: string,
    @Param('amenityId') amenityId: string,
  ) {
    return this.hotelService.removeAmenityFromHotel(id, amenityId);
  }

  @Post(':id/images')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Add multiple images to hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
        },
      },
    },
  })
  @ResponseMessage('Add images to hotel successfully')
  addImages(
    @Param('id') id: string,
    @Body('imageUrls') imageUrls: string[],
  ) {
    return this.hotelService.addImagesToHotel(id, imageUrls);
  }

  @Post(':id/images/upload')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Upload images to hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ResponseMessage('Upload images successfully')
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.hotelService.uploadImages(id, files);
  }

  @Delete(':id/images')
  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Remove image from hotel' })
  @ApiParam({ name: 'id', description: 'Hotel ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
      },
    },
  })
  @ResponseMessage('Remove image from hotel successfully')
  removeImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.hotelService.removeImageFromHotel(id, imageUrl);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: '[Admin] Delete hotel by id' })
  @ResponseMessage('Delete hotel successfully')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
