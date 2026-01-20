import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '@/decorator/customize';
import { Types } from 'mongoose';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'The review has been successfully created.',
  })
  @ResponseMessage('Review created successfully')
  create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const user_id = req.user._id;
    return this.reviewService.create(user_id, createReviewDto);
  }

  @Get(':hotel_id')
  @ApiOperation({ summary: 'Get all reviews for a hotel' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews for the specified hotel',
  })
  @ResponseMessage('Reviews retrieved successfully')
  getAllByHotel(@Param('hotel_id') hotel_id: string, @Req() req) {
    const user_id = req.user._id;
    return this.reviewService.findAllByHotel(new Types.ObjectId(hotel_id), user_id);
  }
}
