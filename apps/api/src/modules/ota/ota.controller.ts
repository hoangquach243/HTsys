import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OtaService } from './ota.service';
import { CreateOtaChannelDto, UpdateOtaChannelDto, CreateOtaMappingDto, OtaWebhookDto } from './dto/ota.dto';

@Controller('ota')
export class OtaController {
    constructor(private readonly otaService: OtaService) { }

    // ===== CHANNELS =====
    @UseGuards(AuthGuard('jwt'))
    @Get('channels')
    findAllChannels(@Query('propertyId') propertyId: string) {
        return this.otaService.findAllChannels(propertyId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('channels/:id')
    findChannelById(@Param('id') id: string) {
        return this.otaService.findChannelById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('channels')
    createChannel(@Body() dto: CreateOtaChannelDto) {
        return this.otaService.createChannel(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('channels/:id')
    updateChannel(@Param('id') id: string, @Body() dto: UpdateOtaChannelDto) {
        return this.otaService.updateChannel(id, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('channels/:id')
    deleteChannel(@Param('id') id: string) {
        return this.otaService.deleteChannel(id);
    }

    // ===== MAPPINGS =====
    @UseGuards(AuthGuard('jwt'))
    @Post('mappings')
    createMapping(@Body() dto: CreateOtaMappingDto) {
        return this.otaService.createMapping(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('mappings/:id')
    deleteMapping(@Param('id') id: string) {
        return this.otaService.deleteMapping(id);
    }

    // ===== LOGS =====
    @UseGuards(AuthGuard('jwt'))
    @Get('channels/:id/logs')
    getSyncLogs(@Param('id') id: string, @Query('limit') limit?: string) {
        return this.otaService.getSyncLogs(id, limit ? parseInt(limit, 10) : 50);
    }

    // ===== WEBHOOK =====
    // Note: No AuthGuard because external OTAs will call this
    @Post('webhook')
    handleWebhook(@Body() payload: OtaWebhookDto) {
        return this.otaService.processWebhook(payload);
    }
}
