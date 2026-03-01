import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, CreateTaskTemplateDto, UpdateTaskTemplateDto } from './dto/tasks.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    // ===== TASKS =====

    findAllTasks(propertyId: string, query?: any) {
        const where: any = { propertyId };

        if (query?.status) where.status = query.status;
        if (query?.type) where.type = query.type;
        if (query?.assigneeId) where.assigneeId = query.assigneeId;

        return this.prisma.task.findMany({
            where,
            include: {
                room: true,
                assignee: true,
                booking: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findTaskById(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { room: true, assignee: true, booking: true }
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    createTask(dto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                type: dto.type || 'HOUSEKEEPING',
                status: dto.status || 'PENDING',
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                roomId: dto.roomId,
                bookingId: dto.bookingId,
                assigneeId: dto.assigneeId,
                propertyId: dto.propertyId
            },
            include: { room: true, assignee: true }
        });
    }

    async updateTask(id: string, dto: UpdateTaskDto) {
        await this.findTaskById(id); // Ensure exists

        const data: any = { ...dto };
        if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
        if (dto.status === 'COMPLETED') data.completedAt = new Date();

        return this.prisma.task.update({
            where: { id },
            data,
            include: { room: true, assignee: true }
        });
    }

    async deleteTask(id: string) {
        await this.findTaskById(id);
        return this.prisma.task.delete({ where: { id } });
    }

    // ===== TASK TEMPLATES =====

    findAllTemplates(propertyId: string) {
        return this.prisma.taskTemplate.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' }
        });
    }

    createTemplate(dto: CreateTaskTemplateDto) {
        return this.prisma.taskTemplate.create({
            data: dto
        });
    }

    updateTemplate(id: string, dto: UpdateTaskTemplateDto) {
        return this.prisma.taskTemplate.update({
            where: { id },
            data: dto
        });
    }

    deleteTemplate(id: string) {
        return this.prisma.taskTemplate.delete({ where: { id } });
    }
}
