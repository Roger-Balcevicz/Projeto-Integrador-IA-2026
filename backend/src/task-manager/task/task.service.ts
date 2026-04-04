import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  public async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  public async findById(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }
}
