import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/bookings.dto';

@Controller('bookings')
// @UseGuards(AuthGuard('jwt')) // Temporarily disabled for UI testing
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    findAll(
        @Query('propertyId') propertyId: string,
        @Query('status') status?: string,
        @Query('source') source?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.bookingsService.findAll(propertyId, { status, source, startDate, endDate });
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.bookingsService.findById(id);
    }

    @Post()
    create(@Request() req: any, @Body() dto: CreateBookingDto) {
        const userId = req.user?.id || undefined; // AuthGuard is temporarily bypassed
        return this.bookingsService.create(userId, dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
        return this.bookingsService.update(id, dto);
    }

    @Post(':id/payments')
    addPayment(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { amount: number; method: string; note?: string }
    ) {
        const staffId = req.user?.id;
        return this.bookingsService.addPayment(id, body.amount, body.method, body.note, staffId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.bookingsService.delete(id);
    }
}
