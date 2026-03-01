import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('financial')
    getFinancialSummary(
        @Query('propertyId') propertyId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.reportsService.getFinancialSummary(propertyId, startDate, endDate);
    }

    @Get('operational')
    getOperationalStats(
        @Query('propertyId') propertyId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.reportsService.getOperationalStats(propertyId, startDate, endDate);
    }
}
