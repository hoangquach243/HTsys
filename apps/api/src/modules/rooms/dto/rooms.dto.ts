import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RoomTypeKind {
    ROOM = 'ROOM',
    DORM = 'DORM',
}

export class CreateRoomTypeDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsEnum(RoomTypeKind)
    @IsOptional()
    kind?: RoomTypeKind;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    maxAdults?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    maxChildren?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    maxInfants?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    basePrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    weekendPrice?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];

    @IsString()
    propertyId: string;
}

export class UpdateRoomTypeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsEnum(RoomTypeKind)
    @IsOptional()
    kind?: RoomTypeKind;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    maxAdults?: number;

    @IsNumber()
    @IsOptional()
    maxChildren?: number;

    @IsNumber()
    @IsOptional()
    maxInfants?: number;

    @IsNumber()
    @IsOptional()
    basePrice?: number;

    @IsNumber()
    @IsOptional()
    weekendPrice?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class CreateRoomDto {
    @IsString()
    roomNumber: string;

    @IsString()
    @IsOptional()
    floor?: string;

    @IsString()
    @IsOptional()
    area?: string;

    @IsString()
    roomTypeId: string;
}

export class UpdateRoomDto {
    @IsString()
    @IsOptional()
    roomNumber?: string;

    @IsString()
    @IsOptional()
    floor?: string;

    @IsString()
    @IsOptional()
    area?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateRatePlanDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    basePrice: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    weekendPrice?: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
