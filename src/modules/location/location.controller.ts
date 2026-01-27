import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public, ResponseMessage } from '@/decorator/customize';

@ApiTags('location')
@ApiBearerAuth()
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new location' })
  @ResponseMessage('Create location successfully')
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all locations' })
  @ResponseMessage('Get all locations successfully')
  findAll() {
    return this.locationService.findAll();
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular locations' })
  @ResponseMessage('Get popular locations successfully')
  findPopular() {
    return this.locationService.findPopular();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get location by ID' })
  @ResponseMessage('Get location successfully')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update location' })
  @ResponseMessage('Update location successfully')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete location' })
  @ResponseMessage('Delete location successfully')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
}
