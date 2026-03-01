import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService } from './rooms.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto, CreateRoomDto, UpdateRoomDto, CreateRatePlanDto } from './dto/rooms.dto';

@Controller('rooms')
// @UseGuards(AuthGuard('jwt'))
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    // ===== Room Types =====

    @Get('types')
    findAllTypes(@Query('propertyId') propertyId: string) {
        return this.roomsService.findAllTypes(propertyId);
    }

    @Get('types/:id')
    findTypeById(@Param('id') id: string) {
        return this.roomsService.findTypeById(id);
    }

    @Post('types')
    createType(@Body() dto: CreateRoomTypeDto) {
        return this.roomsService.createType(dto);
    }

    @Patch('types/:id')
    updateType(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
        return this.roomsService.updateType(id, dto);
    }

    @Delete('types/:id')
    deleteType(@Param('id') id: string) {
        return this.roomsService.deleteType(id);
    }

    // ===== Rooms =====

    @Get()
    findAllRooms(@Query('propertyId') propertyId: string) {
        return this.roomsService.findAllRooms(propertyId);
    }

    @Post()
    createRoom(@Body() dto: CreateRoomDto) {
        return this.roomsService.createRoom(dto);
    }

    @Patch(':id')
    updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        return this.roomsService.updateRoom(id, dto);
    }

    @Delete(':id')
    deleteRoom(@Param('id') id: string) {
        return this.roomsService.deleteRoom(id);
    }

    // ===== Rate Plans =====

    @Get('types/:id/rate-plans')
    findRatePlans(@Param('id') roomTypeId: string) {
        return this.roomsService.findRatePlans(roomTypeId);
    }

    @Post('types/:id/rate-plans')
    createRatePlan(@Param('id') roomTypeId: string, @Body() dto: CreateRatePlanDto) {
        return this.roomsService.createRatePlan(roomTypeId, dto);
    }

    @Delete('rate-plans/:id')
    deleteRatePlan(@Param('id') id: string) {
        return this.roomsService.deleteRatePlan(id);
    }
}
