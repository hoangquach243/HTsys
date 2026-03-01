import { TaskStatus, TaskType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsDateString()
    dueDate?: string | Date;

    @IsOptional()
    @IsString()
    roomId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsString()
    propertyId: string;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsDateString()
    dueDate?: string | Date;

    @IsOptional()
    @IsString()
    roomId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;
}

export class CreateTaskTemplateDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subtasks?: string[];

    @IsString()
    propertyId: string;
}

export class UpdateTaskTemplateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subtasks?: string[];
}
