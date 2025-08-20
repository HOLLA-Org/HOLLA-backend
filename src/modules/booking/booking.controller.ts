import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage, Public } from '@/decorator/customize';
import { BookingStatus } from '@/constant';
@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  @ResponseMessage('Booking created successfully.')
  create(@Body() createBookingDto: CreateBookingDto, @Req() req) {
    const user_id = req.user._id;
    return this.bookingService.create({ user_id, createBookingDto });
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
  @ApiOperation({ summary: 'Get all bookings by status' })
  @ApiResponse({
    status: 200,
    description: "Return a user's bookings filtered by status.",
  })
  getAllByStatus(@Req() req, @Param('status') status: BookingStatus) {
    const user_id = req.user._id;
    return this.bookingService.getAllByStatus(user_id, status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'User cancels their own booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
  @ResponseMessage('Booking cancelled successfully.')
  cancel(@Param('id') _id: string, @Req() req) {
    const user_id = req.user._id;
    return this.bookingService.cancelBooking(_id, user_id);
  }
}
