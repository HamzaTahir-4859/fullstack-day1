import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, status, categoryName } = createTaskDto;
    this.logger.log(`Creating task in DB: ${title}`);

    return this.prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        // Relational query: Connects to an existing category or creates a new one
        ...(categoryName && {
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName },
            },
          },
        }),
      },
      include: { category: true }, // Returns the linked category in the response
    });
  }

  async findAll() {
    this.logger.log('Fetching all tasks with their categories from DB');
    return this.prisma.task.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    this.logger.log(`Fetching task ID ${id} from DB`);
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!task) {
      this.logger.warn(`Task ID ${id} not found in DB`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    // Verify task exists first (Data Integrity check)
    await this.findOne(id);

    const { title, description, status, categoryName } = updateTaskDto;
    this.logger.log(`Updating task ID ${id} in DB`);

    return this.prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        ...(categoryName && {
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName },
            },
          },
        }),
      },
      include: { category: true },
    });
  }

  async remove(id: number) {
    // Verify task exists before deleting
    await this.findOne(id);

    this.logger.log(`Deleting task ID ${id} from DB`);
    return this.prisma.task.delete({
      where: { id },
    });
  }
}