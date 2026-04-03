import { TaskStatus } from './task-status';
import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from '../../chat/message.model';
import { Customer } from '../customer/customer.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Customer',
  })
  customer: Customer;

  @Prop({ required: true })
  status: TaskStatus = TaskStatus.IN_PROGRESS_AI;

  @Prop()
  intent?: string; // Revelação de fotos, pedido de orçamento, etc. Não deverá ser string

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true, type: [Message] })
  messages: Message[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
