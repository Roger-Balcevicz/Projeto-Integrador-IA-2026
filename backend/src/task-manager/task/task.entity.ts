import { TaskStatus } from './task-status';

export class Task {
  id: number;
  title: string;
  description: string;
  customerContactName: string;
  customerPhone: string;
  status: TaskStatus = TaskStatus.IN_PROGRESS_AI;
  startDate: Date;
  endDate: Date;
}
