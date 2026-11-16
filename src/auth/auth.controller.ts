import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
// import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import { type User } from '../user/types/user.type.js';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt.guard.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }

  @Post('register')
  register(@Body() registerRequestDto: CreateUserDto) {
    return this.authService.register(registerRequestDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: { user: { userId: string; refreshToken: string } }) {
    const { userId, refreshToken } = req.user;
    return this.authService.refresh(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: { user: { userId: string } }) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: User }) {
    return req.user;
  }
}
