import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    method?: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsString()
    bookingId: string;

    @IsOptional()
    @IsString()
    staffId?: string;
}

export class CreateExpenseDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean;

    @IsOptional()
    @IsString()
    recurringInterval?: string;

    @IsOptional()
    @IsDateString()
    recurringEndDate?: Date;

    @IsString()
    propertyId: string;

    @IsOptional()
    @IsString()
    createdById?: string;
}

export class UpdateExpenseDto {
    code?: string;
    title?: string;
    category?: string;
    description?: string;
    amount?: number;
    date?: Date;
    isRecurring?: boolean;
    recurringInterval?: string;
    recurringEndDate?: Date;
    isActive?: boolean;
}
