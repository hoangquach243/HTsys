import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';
import { CreatePaymentDto, CreateExpenseDto, UpdateExpenseDto } from './dto/finance.dto';

@Controller('finance')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    // ===== PAYMENTS =====
    @Get('payments')
    findAllPayments(
        @Query('propertyId') propertyId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.financeService.findAllPayments(propertyId, startDate, endDate);
    }

    @Post('payments')
    createPayment(@Body() dto: CreatePaymentDto) {
        return this.financeService.createPayment(dto);
    }

    // ===== EXPENSES =====
    @Get('expenses')
    findAllExpenses(
        @Query('propertyId') propertyId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.financeService.findAllExpenses(propertyId, startDate, endDate);
    }

    @Post('expenses')
    createExpense(@Body() dto: CreateExpenseDto) {
        return this.financeService.createExpense(dto);
    }

    @Patch('expenses/:id')
    updateExpense(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
        return this.financeService.updateExpense(id, dto);
    }

    @Delete('expenses/:id')
    deleteExpense(@Param('id') id: string) {
        return this.financeService.deleteExpense(id);
    }
}
