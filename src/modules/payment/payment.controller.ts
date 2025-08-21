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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, ResponseMessage } from '@/decorator/customize';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'The payment has been successfully created.',
  })
  @ResponseMessage('Payment created successfully')
  create(@Req() req, @Body() createPaymentDto: CreatePaymentDto) {
    const user_id = req.user._id;
    return this.paymentService.create(user_id, createPaymentDto);
  }

  @Get()
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all payments.',
  })
  @ResponseMessage('Payments retrieved successfully')
  getAll() {
    return this.paymentService.getdAll();
  }

  @Delete(':id')
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Delete a payment by id' })
  @ApiResponse({
    status: 200,
    description: 'The payment has been successfully deleted.',
  })
  @ResponseMessage('Payment deleted successfully')
  delete(@Param('id') _id: string) {
    return this.paymentService.remove(_id);
  }
}
