import { BookingStatus, PaymentStatus } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BookingRoomDto {
    @IsString()
    roomTypeId: string;

    @IsOptional()
    @IsString()
    roomId?: string;

    @IsNumber()
    price: number;

    @IsDateString()
    checkIn: string;

    @IsDateString()
    checkOut: string;
}

export class CreateBookingDto {
    @IsString()
    guestId: string;

    @IsString()
    propertyId: string;

    @IsOptional()
    @IsString()
    source?: string;

    @IsDateString()
    checkIn: Date | string;

    @IsDateString()
    checkOut: Date | string;

    @IsOptional()
    @IsNumber()
    nights?: number;

    @IsOptional()
    @IsNumber()
    adults?: number;

    @IsOptional()
    @IsNumber()
    children?: number;

    @IsOptional()
    @IsNumber()
    infants?: number;

    @IsOptional()
    @IsNumber()
    totalAmount?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingRoomDto)
    rooms?: BookingRoomDto[];
}

export class UpdateBookingDto {
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @IsOptional()
    @IsDateString()
    checkIn?: Date | string;

    @IsOptional()
    @IsDateString()
    checkOut?: Date | string;

    @IsOptional()
    @IsNumber()
    totalAmount?: number;

    @IsOptional()
    @IsNumber()
    paidAmount?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    roomId?: string;
}
