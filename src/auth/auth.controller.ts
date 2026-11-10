import { Controller, Post, Body, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }

  @Post('/register')
  register(@Body() registerRequestDto: CreateUserDto) {
    return this.authService.register(registerRequestDto);
  }
}
