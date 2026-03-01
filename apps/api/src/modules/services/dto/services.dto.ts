import { PricingMode, ServiceType } from '@prisma/client';

export class CreateServiceDto {
    name: string;
    code?: string;
    group?: string;
    price?: number;
    pricingMode?: PricingMode;
    description?: string;
    type?: ServiceType;
    isActive?: boolean;
    propertyId: string;
}

export class UpdateServiceDto {
    name?: string;
    code?: string;
    group?: string;
    price?: number;
    pricingMode?: PricingMode;
    description?: string;
    type?: ServiceType;
    isActive?: boolean;
}

export class CreateServiceUsageDto {
    serviceId: string;
    bookingId: string;
    quantity?: number;
    unitPrice: number;
    amount: number;
    date?: Date;
    note?: string;
}
