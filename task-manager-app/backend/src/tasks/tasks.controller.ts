import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks') // This creates the '/tasks' route
export class TasksController {
  // Injecting the service into the controller
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async fetchAllTasks() {
    return await this.tasksService.getTasks();
  }
}