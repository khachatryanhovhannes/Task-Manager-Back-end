import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(user: User) {
    const fullUser = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
      include: {
        Task: true,
      },
    });

    delete fullUser.password;
    delete fullUser.hashedRefreshToken;
    const { Task: tasks, ...rest } = fullUser;
    const userWithTasks = { ...rest, tasks };

    return { data: userWithTasks };
  }

  async updateMe(user: User, dto: UpdateDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: dto,
    });

    delete updatedUser.hashedRefreshToken;
    delete updatedUser.password;

    return { data: updatedUser };
  }
}
