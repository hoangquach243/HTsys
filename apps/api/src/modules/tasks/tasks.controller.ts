import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateTaskTemplateDto, UpdateTaskTemplateDto } from './dto/tasks.dto';

@Controller('tasks')
// @UseGuards(AuthGuard('jwt')) // Temporarily disabled for UI testing
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // ===== TASKS =====

    @Get()
    findAllTasks(
        @Query('propertyId') propertyId: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('assigneeId') assigneeId?: string,
    ) {
        return this.tasksService.findAllTasks(propertyId, { status, type, assigneeId });
    }

    @Get(':id')
    findTaskById(@Param('id') id: string) {
        return this.tasksService.findTaskById(id);
    }

    @Post()
    createTask(@Body() dto: CreateTaskDto) {
        return this.tasksService.createTask(dto);
    }

    @Patch(':id')
    updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.tasksService.updateTask(id, dto);
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        return this.tasksService.deleteTask(id);
    }

    // ===== TASK TEMPLATES =====

    @Get('templates/all')
    findAllTemplates(@Query('propertyId') propertyId: string) {
        return this.tasksService.findAllTemplates(propertyId);
    }

    @Post('templates/new')
    createTemplate(@Body() dto: CreateTaskTemplateDto) {
        return this.tasksService.createTemplate(dto);
    }

    @Patch('templates/:id')
    updateTemplate(@Param('id') id: string, @Body() dto: UpdateTaskTemplateDto) {
        return this.tasksService.updateTemplate(id, dto);
    }

    @Delete('templates/:id')
    deleteTemplate(@Param('id') id: string) {
        return this.tasksService.deleteTemplate(id);
    }
}
