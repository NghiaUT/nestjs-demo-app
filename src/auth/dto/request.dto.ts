import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto.js';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: number;
}
