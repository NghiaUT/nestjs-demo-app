import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Department } from '../entities/user.entity.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  age: number;

  department: Department;

  @IsBoolean()
  isManager: boolean;

  @IsString()
  password: string;
}
