import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Task } from './task.schema';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async listAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async get(@Param() id: string): Promise<Task | null> {
    return this.taskService.findById(id);
  }
}
