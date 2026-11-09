import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { UserService } from '../user/user.service.js';
import { User } from '../user/entities/user.entity.js';

type ReturnUser = Omit<User, 'password'>;
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  register(registerRequestDto: CreateUserDto): {
    user: ReturnUser;
    token: string;
  } {
    const existUser = this.userService.findWithEmail(registerRequestDto.email);
    if (existUser)
      throw new BadRequestException(
        'Email đã được sử dụng. Vui lòng đổi email khác.',
      );
    return {
      user: this.userService.create(registerRequestDto).user,
      token: 'valid',
    };
  }

  login(loginRequestDto: LoginRequestDto): { user: ReturnUser; token: string } {
    const user = this.userService.findWithEmail(loginRequestDto.email);
    if (!user)
      throw new BadRequestException('Email chưa tồn tại trong hệ thống.');
    return {
      user: user,
      token: 'valid',
    };
  }
}
