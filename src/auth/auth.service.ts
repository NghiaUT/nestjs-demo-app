import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { User } from '../user/schemas/user.schema.js';
import { UserRepository } from '../user/repositories/user.repository.js';

type ReturnUser = Omit<User, 'passwordHash' | 'balance'>;
@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}
  async register(registerRequestDto: CreateUserDto): Promise<{
    user: ReturnUser;
    token: string;
  }> {
    const existUser = await this.userRepository.findByEmail(
      registerRequestDto.email,
    );
    if (existUser)
      throw new BadRequestException(
        'Email đã được sử dụng. Vui lòng đổi email khác.',
      );
    const user = await this.userRepository.create({
      ...registerRequestDto,
      passwordHash: registerRequestDto.password,
    });
    return {
      user: user,
      token: 'valid',
    };
  }

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ user: ReturnUser; token: string }> {
    const result = await this.userRepository.findCredentials(
      loginRequestDto.email,
    );
    if (!result || loginRequestDto.password !== result?.passwordHash)
      throw new BadRequestException(
        'Sai mật khẩu hoặc email chưa tồn tại trong hệ thống.',
      );
    return {
      user: result.user,
      token: 'valid',
    };
  }
}
