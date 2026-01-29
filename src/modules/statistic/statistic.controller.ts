import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseMessage } from '@/decorator/customize';
import { Roles, Role } from '@/decorator/roles.decorator';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('statistics')
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) { }

    @Get('dashboard')
    @Roles(Role.Admin)
    @ApiOperation({ summary: '[Admin] Get dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Return dashboard statistics.' })
    @ResponseMessage('Get dashboard statistics successfully')
    async getDashboardStats() {
        return this.statisticService.getDashboardStats();
    }

    @Get('chart')
    @Roles(Role.Admin)
    @ApiOperation({ summary: '[Admin] Get chart statistics' })
    @ApiResponse({ status: 200, description: 'Return chart statistics.' })
    @ResponseMessage('Get chart statistics successfully')
    async getChartData(
        @Query('type') type: 'week' | 'month' | 'year' = 'year',
        @Query('date') date?: string
    ) {
        return this.statisticService.getChartData(type, date);
    }

    @Get('recent-bookings')
    @Roles(Role.Admin)
    @ApiOperation({ summary: '[Admin] Get 5 recent bookings' })
    @ApiResponse({ status: 200, description: 'Return recent bookings.' })
    @ResponseMessage('Get recent bookings successfully')
    async getRecentBookings() {
        return this.statisticService.getRecentBookings();
    }
}
