import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceUsageDto } from './dto/services.dto';

@Controller('services')
//@UseGuards(AuthGuard('jwt'))
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    findAll(
        @Query('propertyId') propertyId: string,
        @Query('isActive') isActive?: string,
        @Query('type') type?: string,
        @Query('group') group?: string
    ) {
        return this.servicesService.findAll(propertyId, { isActive, type, group });
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.servicesService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateServiceDto) {
        return this.servicesService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
        return this.servicesService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.servicesService.delete(id);
    }

    // ===== USAGES =====

    @Get('usages/:bookingId')
    getBookingServices(@Param('bookingId') bookingId: string) {
        return this.servicesService.getBookingServices(bookingId);
    }

    @Post('usages')
    addServiceToBooking(@Body() dto: CreateServiceUsageDto) {
        return this.servicesService.addServiceToBooking(dto);
    }

    @Delete('usages/:usageId')
    removeServiceFromBooking(@Param('usageId') usageId: string) {
        return this.servicesService.removeServiceFromBooking(usageId);
    }

    @Patch('usages/:usageId')
    updateServiceUsage(@Param('usageId') usageId: string, @Body() dto: { quantity: number; amount: number }) {
        return this.servicesService.updateServiceUsage(usageId, dto.quantity, dto.amount);
    }
}
