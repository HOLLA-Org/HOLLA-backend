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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.paymentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentService.update(+id, updatePaymentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymentService.remove(+id);
  // }
}
