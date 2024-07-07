import { Injectable } from '@nestjs/common';
import { AddDto, EditDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

interface GetTasksParams {
  take: number;
  skip: number;
  dueDate?: string;
  status?: string;
}

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  async addTask(user: User, task: AddDto) {
    const createdTask = await this.prisma.task.create({
      data: {
        userId: user.id,
        ...task,
      },
    });

    return { data: createdTask };
  }

  async getTaskById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    return { data: task };
  }

  async editTaskById(id: number, task: EditDto) {
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: task,
    });

    return { data: updatedTask };
  }

  async deleteTaskById(id: number) {
    const deletedTask = await this.prisma.task.delete({
      where: { id },
    });

    return { data: deletedTask };
  }

  async getTasks({ take = 12, skip = 0, dueDate, status }: GetTasksParams) {
    const where: any = {};
    if (dueDate) {
      where.dueDate = {
        lt: new Date(dueDate).toISOString(),
      };
    }
    if (status) {
      where.status = status;
    }

    const tasks = await this.prisma.task.findMany({
      take,
      skip,
      where,
    });

    const total = await this.prisma.task.count({
      where,
    });

    return { data: tasks, _meta: { total } };
  }
}
