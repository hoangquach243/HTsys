import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import {
    UpdatePropertyDto,
    CreatePaymentMethodDto, UpdatePaymentMethodDto,
    CreateBankAccountDto, UpdateBankAccountDto,
    CreateBookingSourceDto, UpdateBookingSourceDto,
    CreateLabelDto, UpdateLabelDto
} from './dto/settings.dto';

@Controller('settings')
// @UseGuards(AuthGuard('jwt'))
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    // ===== PROPERTY INFO =====
    @Get('property/:id')
    getProperty(@Param('id') id: string) {
        return this.settingsService.getProperty(id);
    }

    @Patch('property/:id')
    updateProperty(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
        return this.settingsService.updateProperty(id, dto);
    }

    // ===== PAYMENT METHODS =====
    @Get('payment-methods')
    getPaymentMethods(@Query('propertyId') propertyId: string) {
        return this.settingsService.getPaymentMethods(propertyId);
    }

    @Post('payment-methods')
    createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
        return this.settingsService.createPaymentMethod(dto);
    }

    @Patch('payment-methods/:id')
    updatePaymentMethod(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
        return this.settingsService.updatePaymentMethod(id, dto);
    }

    @Delete('payment-methods/:id')
    deletePaymentMethod(@Param('id') id: string) {
        return this.settingsService.deletePaymentMethod(id);
    }

    // ===== BANK ACCOUNTS =====
    @Get('bank-accounts')
    getBankAccounts(@Query('propertyId') propertyId: string) {
        return this.settingsService.getBankAccounts(propertyId);
    }

    @Post('bank-accounts')
    createBankAccount(@Body() dto: CreateBankAccountDto) {
        return this.settingsService.createBankAccount(dto);
    }

    @Patch('bank-accounts/:id')
    updateBankAccount(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
        return this.settingsService.updateBankAccount(id, dto);
    }

    @Delete('bank-accounts/:id')
    deleteBankAccount(@Param('id') id: string) {
        return this.settingsService.deleteBankAccount(id);
    }

    // ===== BOOKING SOURCES =====
    @Get('sources')
    getBookingSources(@Query('propertyId') propertyId: string) {
        return this.settingsService.getBookingSources(propertyId);
    }

    @Post('sources')
    createBookingSource(@Body() dto: CreateBookingSourceDto) {
        return this.settingsService.createBookingSource(dto);
    }

    @Patch('sources/:id')
    updateBookingSource(@Param('id') id: string, @Body() dto: UpdateBookingSourceDto) {
        return this.settingsService.updateBookingSource(id, dto);
    }

    @Delete('sources/:id')
    deleteBookingSource(@Param('id') id: string) {
        return this.settingsService.deleteBookingSource(id);
    }

    // ===== LABELS =====
    @Get('labels')
    getLabels(@Query('propertyId') propertyId: string) {
        return this.settingsService.getLabels(propertyId);
    }

    @Post('labels')
    createLabel(@Body() dto: CreateLabelDto) {
        return this.settingsService.createLabel(dto);
    }

    @Patch('labels/:id')
    updateLabel(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
        return this.settingsService.updateLabel(id, dto);
    }

    @Delete('labels/:id')
    deleteLabel(@Param('id') id: string) {
        return this.settingsService.deleteLabel(id);
    }

    // ===== CATEGORIES =====
    @Get('categories')
    getCategories(@Query('propertyId') propertyId: string) {
        return this.settingsService.getCategories(propertyId);
    }

    @Post('categories')
    createCategory(@Body() dto: any) {
        return this.settingsService.createCategory(dto);
    }

    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() dto: any) {
        return this.settingsService.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.settingsService.deleteCategory(id);
    }
}
