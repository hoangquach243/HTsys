import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AutomationService } from './automation.service';
import {
    CreateEmailTemplateDto,
    UpdateEmailTemplateDto,
    CreateEmailFlowDto,
    UpdateEmailFlowDto
} from './dto/automation.dto';

@Controller('automation')
@UseGuards(AuthGuard('jwt'))
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    // ===== TEMPLATES =====
    @Get('templates')
    findAllTemplates(@Query('propertyId') propertyId: string) {
        return this.automationService.findAllTemplates(propertyId);
    }

    @Post('templates')
    createTemplate(@Body() dto: CreateEmailTemplateDto) {
        return this.automationService.createTemplate(dto);
    }

    @Patch('templates/:id')
    updateTemplate(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
        return this.automationService.updateTemplate(id, dto);
    }

    @Delete('templates/:id')
    deleteTemplate(@Param('id') id: string) {
        return this.automationService.deleteTemplate(id);
    }

    // ===== FLOWS =====
    @Get('flows')
    findAllFlows(@Query('propertyId') propertyId: string) {
        return this.automationService.findAllFlows(propertyId);
    }

    @Post('flows')
    createFlow(@Body() dto: CreateEmailFlowDto) {
        return this.automationService.createFlow(dto);
    }

    @Patch('flows/:id')
    updateFlow(@Param('id') id: string, @Body() dto: UpdateEmailFlowDto) {
        return this.automationService.updateFlow(id, dto);
    }

    @Delete('flows/:id')
    deleteFlow(@Param('id') id: string) {
        return this.automationService.deleteFlow(id);
    }
}
