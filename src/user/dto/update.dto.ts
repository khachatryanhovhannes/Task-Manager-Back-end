import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @IsNotEmpty()
  @MinLength(3)
  lastName: string;
}
