import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Rooms')
// @ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: 'Create a new Room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiBody({ type: CreateRoomDto })
  @ResponseMessage('Create new Room successfully')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }

  @Get(':hotel_id')
  @Public()
  @ApiOperation({ summary: 'Get all rooms for a specific hotel' })
  @ApiResponse({ status: 200, description: 'List of rooms for the hotel.' })
  @ApiResponse({ status: 404, description: 'Hotel not found.' })
  async getAllByHotelId(@Param('hotel_id') hotel_id: string) {
    return this.roomService.getAllByHotelId(hotel_id);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
