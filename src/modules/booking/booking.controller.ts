import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, Public } from '@/decorator/customize';
@ApiTags('Bookings')
// @ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  @ResponseMessage('Booking created successfully.')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Patch('confirm/:id')
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Confirm a pending booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiResponse({
    status: 400,
    description: 'Booking is not in a pending state.',
  })
  confirm(@Param('id') _id: string) {
    return this.bookingService.confirmBooking(_id);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}
