import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { Role, Roles } from '@/decorator/roles.decorator';
import { ResponseMessage } from '@/decorator/customize';

@ApiBearerAuth()
@ApiTags('Favorites')
@Roles(Role.User)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}


  @Post(':hotelId')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a hotel to favorite list' })
  @ApiParam({
    name: 'hotelId',
    description: 'The ID of the hotel to add to favorites',
  })
  @ApiResponse({
    status: 201,
    description: 'Hotel added to favorite successfully',
  })
  @ResponseMessage('Add favorite successfully')
  addFavorite(
    @Request() req: RequestWithUser,
    @Param('hotelId') hotelId: string,
  ) {
    return this.favoriteService.add(req.user._id, hotelId);
  }

  @Delete(':hotelId')
  @ApiOperation({ summary: 'Remove a hotel from favorite list' })
  @ApiParam({
    name: 'hotelId',
    description: 'The ID of the hotel to remove from favorites',
  })
  @ApiResponse({
    status: 200,
    description: 'Hotel removed from favorite successfully',
  })
  @ResponseMessage('Remove favorite successfully')
  removeFavorite(
    @Request() req: RequestWithUser,
    @Param('hotelId') hotelId: string,
  ) {
    return this.favoriteService.remove(req.user._id, hotelId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite hotels of current user' })
  @ApiResponse({
    status: 200,
    description: 'Return list of favorite hotels',
  })
  @ResponseMessage('Get favorite hotels successfully')
  getMyFavorites(@Request() req: RequestWithUser) {
    return this.favoriteService.getMyFavorites(req.user._id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get list of favorite hotel IDs' })
  @ApiResponse({
    status: 200,
    description: 'Return list of hotel IDs',
  })
  @ResponseMessage('Get favorite hotel ids successfully')
  getFavoriteIds(@Request() req: RequestWithUser) {
    return this.favoriteService.getFavoriteIds(req.user._id);
  }
}
