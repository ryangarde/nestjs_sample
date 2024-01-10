import { Module } from '@nestjs/common';
import { TaskController } from './task/task.controller';

@Module({
  controllers: [TaskController]
})
export class TaskModule {}
