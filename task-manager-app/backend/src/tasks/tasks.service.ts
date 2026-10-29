import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId?: number) {
    const { title, description, status, categoryName } = createTaskDto as any;

    return this.prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        ...(userId && {
          user: { connect: { id: Number(userId) } },
        }),
        ...(categoryName && {
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName },
            },
          },
        }),
      },
      include: { category: true, user: true },
    });
  }

  async findAll(user?: any) {
    // Regular users see their own tasks; Admin sees all tasks
    const whereClause =
      user && user.role !== 'admin' ? { userId: Number(user.sub) } : {};

    return this.prisma.task.findMany({
      where: whereClause,
      include: { category: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { category: true, user: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);
    const { title, description, status, categoryName } = updateTaskDto as any;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(categoryName && {
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName },
            },
          },
        }),
      },
      include: { category: true, user: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }
}