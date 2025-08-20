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
import { BookingStatus } from '@/constant';
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
  @ResponseMessage('Booking confirmed successfully.')
  confirm(@Param('id') _id: string) {
    return this.bookingService.confirmBooking(_id);
  }

  @Get()
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Get all bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully.' })
  @ResponseMessage('Bookings retrieved successfully.')
  getAll() {
    return this.bookingService.getAll();
  }

  @Get('user/:user_id/status/:status')
  @Public()
  @ApiOperation({ summary: 'Get all bookings by status' })
  @ApiResponse({
    status: 200,
    description: "Return a user's bookings filtered by status.",
  })
  getAllByStatus(
    @Param('user_id') user_id: string,
    @Param('status') status: BookingStatus,
  ) {
    return this.bookingService.getAllByStatus(user_id, status);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookingService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
  //   return this.bookingService.update(+id, updateBookingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingService.remove(+id);
  // }
}
