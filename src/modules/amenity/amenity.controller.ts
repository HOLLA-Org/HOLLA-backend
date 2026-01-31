import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AmenityService } from './amenity.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { Roles, Role } from '@/decorator/roles.decorator';
import { Public, ResponseMessage } from '@/decorator/customize';

@ApiTags('Amenity')
@Controller('amenities')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all amenities' })
  @ResponseMessage('Get amenities successfully')
  getAll() {
    return this.amenityService.findAll();
  }

  //  @ApiBearerAuth()
  // @Roles(Role.Admin)
  @Public()
  @Get('all')
  @ApiOperation({ summary: '[Admin] Get all amenities (include inactive)' })
  @ResponseMessage('Get all amenities successfully')
  getAllIncludeInactive() {
    return this.amenityService.findAllIncludeInactive();
  }

  // @ApiBearerAuth()
  // @Roles(Role.Admin)
  @Public()
  @Post()
  @ApiOperation({ summary: '[Admin] Create amenity' })
  @ResponseMessage('Amenity created successfully')
  create(@Body() dto: CreateAmenityDto) {
    return this.amenityService.create(dto);
  }

  // @ApiBearerAuth()
  // @Roles(Role.Admin)
  @Public()
  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update amenity' })
  @ResponseMessage('Amenity updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAmenityDto,
  ) {
    return this.amenityService.update(id, dto);
  }

  // @ApiBearerAuth()
  // @Roles(Role.Admin)
  @Public()
  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete amenity' })
  @ResponseMessage('Amenity deleted successfully')
  remove(@Param('id') id: string) {
    return this.amenityService.remove(id);
  }
}
