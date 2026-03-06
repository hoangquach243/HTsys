import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    // --- Vehicles ---
    @Get('vehicles')
    getVehicles(@Query('propertyId') propertyId: string) {
        return this.rentalsService.getVehicles(propertyId);
    }

    @Post('vehicles')
    createVehicle(@Query('propertyId') propertyId: string, @Body() data: any) {
        return this.rentalsService.createVehicle(propertyId, data);
    }

    @Patch('vehicles/:id')
    updateVehicle(@Param('id') id: string, @Body() data: any) {
        return this.rentalsService.updateVehicle(id, data);
    }

    @Delete('vehicles/:id')
    deleteVehicle(@Param('id') id: string) {
        return this.rentalsService.deleteVehicle(id);
    }

    // --- Rentals ---
    @Get()
    getRentals(@Query('propertyId') propertyId: string) {
        return this.rentalsService.getRentals(propertyId);
    }

    @Post()
    createRental(@Query('propertyId') propertyId: string, @Body() data: any) {
        return this.rentalsService.createRental(propertyId, data);
    }

    @Post(':id/pickup')
    recordPickup(@Param('id') id: string) {
        return this.rentalsService.recordPickup(id);
    }

    @Post(':id/return')
    recordReturn(@Param('id') id: string) {
        return this.rentalsService.recordReturn(id);
    }

    @Patch(':id/status')
    updateRentalStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.rentalsService.updateRentalStatus(id, status);
    }

    @Patch(':id')
    updateRental(@Param('id') id: string, @Body() data: any) {
        return this.rentalsService.updateRental(id, data);
    }

    @Delete(':id')
    deleteRental(@Param('id') id: string) {
        return this.rentalsService.deleteRental(id);
    }
}
