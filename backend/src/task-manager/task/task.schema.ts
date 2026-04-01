import { TaskStatus } from './task-status';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from '../../chat/message.model';

export type TaskDocument = HydratedDocument<Task>;

class Intent {}

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  customer: Customer;

  @Prop({ required: true })
  status: TaskStatus = TaskStatus.IN_PROGRESS_AI;

  @Prop()
  intent: Intent;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true })
  messages: Message[];
}

interface Customer {
  phone: string;
  contactName?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
