import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('revenue')
    getRevenueReport(
        @Query('propertyId') propertyId: string,
        @Query('period') period?: string
    ) {
        return this.reportsService.getRevenueReport(propertyId, period);
    }

    @Get('operations')
    getOperationsReport(
        @Query('propertyId') propertyId: string,
        @Query('period') period?: string
    ) {
        return this.reportsService.getOperationsReport(propertyId, period);
    }

    @Get('payments')
    getPaymentsReport(
        @Query('propertyId') propertyId: string,
        @Query('period') period?: string
    ) {
        return this.reportsService.getPaymentsReport(propertyId, period);
    }

    @Get('services')
    getServicesReport(
        @Query('propertyId') propertyId: string,
        @Query('period') period?: string
    ) {
        return this.reportsService.getServicesReport(propertyId, period);
    }

    @Get('performance')
    getPerformanceReport(
        @Query('propertyId') propertyId: string,
        @Query('period') period?: string
    ) {
        return this.reportsService.getPerformanceReport(propertyId, period);
    }

    @Get('monthly')
    getMonthlyReport(
        @Query('propertyId') propertyId: string,
        @Query('year') year?: string
    ) {
        return this.reportsService.getMonthlyReport(propertyId, year || new Date().getFullYear().toString());
    }
}
