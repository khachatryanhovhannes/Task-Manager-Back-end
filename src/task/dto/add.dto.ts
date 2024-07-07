import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class AddDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dueDate: Date;
}
