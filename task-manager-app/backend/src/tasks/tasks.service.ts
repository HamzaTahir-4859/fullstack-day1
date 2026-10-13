import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// Define the shape of a Task so TypeScript knows what is allowed in the array
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
}

@Injectable()
export class TasksService {
  // Explicitly type the array to hold Task objects
  private tasks: Task[] = [];

  // Create
  create(createTaskDto: CreateTaskDto) {
    const newTask: Task = {
      id: Date.now().toString(),
      ...createTaskDto,
      status: 'OPEN',
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // Read (All)
  findAll() {
    return this.tasks;
  }

  // Read (One by ID)
  findOne(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  // Update
  update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = this.findOne(id);
    Object.assign(task, updateTaskDto);
    return task;
  }

  // Delete
  remove(id: string) {
    this.findOne(id); 
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return { message: `Task ${id} successfully deleted` };
  }
}