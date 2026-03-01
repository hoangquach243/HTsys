import { Gender } from '@prisma/client';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateGuestDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    idNumber?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsDateString()
    dob?: Date;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsString()
    propertyId: string;
}

export class UpdateGuestDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    idNumber?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsDateString()
    dob?: Date;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
