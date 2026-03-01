import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuestsService } from './guests.service';
import { CreateGuestDto, UpdateGuestDto } from './dto/guests.dto';

@Controller('guests')
// @UseGuards(AuthGuard('jwt'))
export class GuestsController {
    constructor(private readonly guestsService: GuestsService) { }

    @Get()
    findAll(
        @Query('propertyId') propertyId: string,
        @Query('search') search?: string
    ) {
        return this.guestsService.findAll(propertyId, search);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.guestsService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateGuestDto) {
        return this.guestsService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateGuestDto) {
        return this.guestsService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.guestsService.delete(id);
    }

    @Post(':id/labels/:labelId')
    addLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
        return this.guestsService.addLabel(id, labelId);
    }

    @Delete(':id/labels/:labelId')
    removeLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
        return this.guestsService.removeLabel(id, labelId);
    }
}
