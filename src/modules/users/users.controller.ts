import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { GetEmailByUserNameDto } from './dto/get-email.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid input data.' })
  @ResponseMessage('Create user successfully')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return a paginated list of users.',
  })
  @ResponseMessage('Get all users successfully')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the user data.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ResponseMessage('Get user successfully')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ResponseMessage('Update user successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Public()
  @Post('get-email-by-username')
  @HttpCode(200)
  @ResponseMessage('Get email successfully')
  getEmailByUsername(@Body() getEmailByUsernameDto: GetEmailByUserNameDto) {
    const { username } = getEmailByUsernameDto;
    return this.usersService.findEmailByUsername(username);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user to delete' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ResponseMessage('Delete user successfully')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
