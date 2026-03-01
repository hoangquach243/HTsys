import { PricingMode, ServiceType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    group?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsEnum(PricingMode)
    pricingMode?: PricingMode;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ServiceType)
    type?: ServiceType;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsString()
    propertyId: string;
}

export class UpdateServiceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    group?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsEnum(PricingMode)
    pricingMode?: PricingMode;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ServiceType)
    type?: ServiceType;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CreateServiceUsageDto {
    @IsString()
    serviceId: string;

    @IsString()
    bookingId: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsNumber()
    unitPrice: number;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsString()
    note?: string;
}
