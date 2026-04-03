import { Controller, Get, Param } from '@nestjs/common';
import { Task } from './task.schema';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async listAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get('/:id')
  async get(@Param() id: string): Promise<Task | null> {
    return this.taskService.findById(id);
  }
}
