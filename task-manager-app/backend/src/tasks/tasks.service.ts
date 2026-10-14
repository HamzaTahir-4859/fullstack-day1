import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface Task {
  id: string;
  title: string;
  description?: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private tasks: Task[] = []; 

  create(createTaskDto: CreateTaskDto) {
    this.logger.log(`Creating new task: ${createTaskDto.title}`);
    const newTask: Task = {
      id: Date.now().toString(),
      ...createTaskDto,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll() {
    this.logger.log('Fetching all tasks');
    return this.tasks;
  }

  findOne(id: string) {
    this.logger.log(`Fetching task with ID: ${id}`);
    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      this.logger.warn(`Task not found: ID ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    this.logger.log(`Updating task with ID: ${id}`);
    const taskIndex = this.tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      this.logger.warn(`Cannot update. Task ID ${id} not found`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updatedTask = { ...this.tasks[taskIndex], ...updateTaskDto };
    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  remove(id: string) {
    this.logger.log(`Deleting task with ID: ${id}`);
    const taskIndex = this.tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      this.logger.error(`Delete failed. Task ID ${id} missing`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const deletedTask = this.tasks.splice(taskIndex, 1);
    return deletedTask[0];
  }
}