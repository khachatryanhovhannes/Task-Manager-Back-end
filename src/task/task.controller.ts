import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AddDto, EditDto } from './dto';
import { TaskService } from './task.service';
import { JwtGuard } from 'src/auth/decorator/guard';

@Controller('task')
@UseGuards(AuthGuard('jwt'))
@UseGuards(JwtGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('/')
  addTask(@GetUser() user: User, @Body() dto: AddDto) {
    this.taskService.addTask(user, dto);
  }

  @Get('/:id')
  getTaskById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.getTaskById(id);
  }

  @Patch('/:id')
  editTaskById(@Param('id', ParseIntPipe) id: number, @Body() dto: EditDto) {
    return this.taskService.editTaskById(id, dto);
  }

  @Delete('/:id')
  deleteTaskById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.deleteTaskById(id);
  }

  @Get('/')
  async getTasks(
    @Query('take') take: number,
    @Query('skip') skip: number,
    @Query('dueDate') dueDate?: string,
    @Query('status') status?: string,
  ) {
    return this.taskService.getTasks({ take, skip, dueDate, status });
  }
}
