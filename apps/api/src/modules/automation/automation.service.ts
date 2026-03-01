import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateEmailTemplateDto,
    UpdateEmailTemplateDto,
    CreateEmailFlowDto,
    UpdateEmailFlowDto
} from './dto/automation.dto';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    // ===== EMAIL TEMPLATES =====

    findAllTemplates(propertyId: string) {
        return this.prisma.emailTemplate.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findTemplateById(id: string) {
        const template = await this.prisma.emailTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        return template;
    }

    createTemplate(dto: CreateEmailTemplateDto) {
        return this.prisma.emailTemplate.create({ data: dto });
    }

    async updateTemplate(id: string, dto: UpdateEmailTemplateDto) {
        await this.findTemplateById(id);
        return this.prisma.emailTemplate.update({ where: { id }, data: dto });
    }

    async deleteTemplate(id: string) {
        await this.findTemplateById(id);
        return this.prisma.emailTemplate.delete({ where: { id } });
    }

    // ===== EMAIL FLOWS =====

    findAllFlows(propertyId: string) {
        return this.prisma.emailFlow.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findFlowById(id: string) {
        const flow = await this.prisma.emailFlow.findUnique({ where: { id } });
        if (!flow) throw new NotFoundException('Flow not found');
        return flow;
    }

    createFlow(dto: CreateEmailFlowDto) {
        const data: any = { ...dto };
        if (dto.conditions) data.conditions = dto.conditions;
        if (dto.actions) data.actions = dto.actions;
        return this.prisma.emailFlow.create({ data });
    }

    async updateFlow(id: string, dto: UpdateEmailFlowDto) {
        await this.findFlowById(id);
        const data: any = { ...dto };
        if (dto.conditions) data.conditions = dto.conditions;
        if (dto.actions) data.actions = dto.actions;
        return this.prisma.emailFlow.update({ where: { id }, data });
    }

    async deleteFlow(id: string) {
        await this.findFlowById(id);
        return this.prisma.emailFlow.delete({ where: { id } });
    }
}
