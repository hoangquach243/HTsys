export class UpdatePropertyDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
    checkInTime?: string;
    checkOutTime?: string;
    timezone?: string;
    currency?: string;
    allowHourly?: boolean;
    requirePayBeforeCheckout?: boolean;
}

export class CreatePaymentMethodDto {
    name: string;
    isActive?: boolean;
    propertyId: string;
}

export class UpdatePaymentMethodDto {
    name?: string;
    isActive?: boolean;
}

export class CreateBankAccountDto {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    isDefault?: boolean;
    propertyId: string;
}

export class UpdateBankAccountDto {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
    isDefault?: boolean;
}

export class CreateBookingSourceDto {
    name: string;
    type?: string;
    isActive?: boolean;
    propertyId: string;
}

export class UpdateBookingSourceDto {
    name?: string;
    type?: string;
    isActive?: boolean;
}

export class CreateLabelDto {
    name: string;
    color?: string;
    propertyId: string;
}

export class UpdateLabelDto {
    name?: string;
    color?: string;
}
