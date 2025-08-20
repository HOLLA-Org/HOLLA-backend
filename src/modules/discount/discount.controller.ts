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
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, ResponseMessage } from '@/decorator/customize';
import { ApplyDiscountDto } from './dto/apply-discount.dto';

@ApiTags('Discounts')
@ApiBearerAuth()
@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: 'Create a new discount code' })
  @ApiResponse({
    status: 201,
    description: 'The discount has been successfully created.',
  })
  @ResponseMessage('Discount created successfully')
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply discount' })
  @ApiResponse({
    status: 200,
    description: 'Discount applied successfully',
  })
  @ResponseMessage('Discount applied successfully')
  async applyDiscount(@Body() applyDiscountDto: ApplyDiscountDto, @Req() req) {
    const { code } = applyDiscountDto;
    const user_id = req.user._id;
    return this.discountService.applyDiscount(code, user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiResponse({ status: 200, description: 'List of all discounts' })
  @ResponseMessage('List of all discounts')
  async getAll() {
    return this.discountService.getAll();
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateDiscountDto: UpdateDiscountDto,
  // ) {
  //   return this.discountService.update(+id, updateDiscountDto);
  // }

  @Patch(':id')
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Update discount by id' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  @ResponseMessage('Update discount successfully')
  @ApiBody({ type: UpdateDiscountDto })
  async update(
    @Param('id') _id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(_id, updateDiscountDto);
  }

  @Delete(':id')
  // @Roles(Role.Admin)
  @Public()
  @ApiOperation({ summary: '[Admin] Delete a discount by id' })
  @ApiResponse({
    status: 200,
    description: 'The discount has been successfully deleted.',
  })
  @ResponseMessage('Delete discount successfully')
  remove(@Param('id') _id: string) {
    return this.discountService.remove(_id);
  }
}
