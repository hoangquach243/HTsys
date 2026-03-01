export class CreatePaymentDto {
    amount: number;
    method?: string; // cash, transfer, card
    note?: string;
    bookingId: string;
    staffId?: string;
}

export class CreateExpenseDto {
    category: string;
    description?: string;
    amount: number;
    date?: Date;
    isRecurring?: boolean;
    recurringInterval?: string; // monthly, quarterly, yearly
    recurringEndDate?: Date;
    propertyId: string;
    createdById?: string;
}

export class UpdateExpenseDto {
    category?: string;
    description?: string;
    amount?: number;
    date?: Date;
    isRecurring?: boolean;
    recurringInterval?: string;
    recurringEndDate?: Date;
    isActive?: boolean;
}
