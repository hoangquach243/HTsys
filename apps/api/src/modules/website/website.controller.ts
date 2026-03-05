import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { WebsiteService } from './website.service';

@Controller('api')
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) { }

    // ---- Dashboard Management ----

    @Get('website/config/:propertyId')
    getConfig(@Param('propertyId') propertyId: string) {
        return this.websiteService.getConfig(propertyId);
    }

    @Put('website/config/:propertyId')
    upsertConfig(@Param('propertyId') propertyId: string, @Body() dto: any) {
        return this.websiteService.upsertConfig(propertyId, dto);
    }

    // ---- Public Client Endpoints (no auth) ----

    @Get('public/:slug')
    getPublicConfig(@Param('slug') slug: string) {
        return this.websiteService.getPublicConfig(slug);
    }

    @Get('public/:slug/rooms')
    getPublicRooms(@Param('slug') slug: string) {
        return this.websiteService.getPublicRoomTypes(slug);
    }

    @Get('public/:slug/availability')
    getAvailability(
        @Param('slug') slug: string,
        @Query('checkIn') checkIn: string,
        @Query('checkOut') checkOut: string,
    ) {
        return this.websiteService.getAvailability(slug, checkIn, checkOut);
    }

    @Post('public/:slug/bookings')
    createPublicBooking(@Param('slug') slug: string, @Body() dto: any) {
        return this.websiteService.createPublicBooking(slug, dto);
    }
}
