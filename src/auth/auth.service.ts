import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { UserService } from '../user/user.service.js';
import { User } from '../user/schemas/user.schema.js';

type ReturnUser = Omit<User, 'password'>;
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async register(registerRequestDto: CreateUserDto): Promise<{
    user: ReturnUser;
    token: string;
  }> {
    const existUser = await this.userService.findWithEmail(
      registerRequestDto.email,
    );
    if (existUser)
      throw new BadRequestException(
        'Email đã được sử dụng. Vui lòng đổi email khác.',
      );
    const result = await this.userService.create(registerRequestDto);
    return {
      user: result.user,
      token: 'valid',
    };
  }

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ user: ReturnUser; token: string }> {
    const user = await this.userService.findWithEmail(loginRequestDto.email);
    if (!user)
      throw new BadRequestException('Email chưa tồn tại trong hệ thống.');
    return {
      user,
      token: 'valid',
    };
  }
}
