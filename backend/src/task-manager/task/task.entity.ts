import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task-status';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  customerContactName: string;

  @Column()
  customerPhone: string;

  @Column()
  status: TaskStatus = TaskStatus.IN_PROGRESS_AI;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;
}
