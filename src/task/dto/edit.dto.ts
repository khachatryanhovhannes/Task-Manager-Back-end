import { Transform } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty } from 'class-validator';

export class EditDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dueDate: Date;

  @IsNotEmpty()
  @IsIn(['To Do', 'In Progress', 'Done'])
  status;
}
