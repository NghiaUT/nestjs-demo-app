import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
  Logger,
  UseInterceptors,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Department } from './entities/user.entity.js';

import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { JwtAuthorizationGuard } from '../common/guards/jwt-auth.guard.js';
import { OwnershipGuard } from '../common/guards/ownership.guard.js';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor.js';
import { ExcludeNullInterceptor } from '../common/interceptors/exclude-null.interceptor.js';
import { AppConfigService } from '../config/config.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { User } from './schemas/user.schema.js';
import { RoleGuard } from '../common/guards/role.guard.js';
import { Role } from '../common/decorators/role.decorator.js';

export class ParamQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(Object.values(Department))
  department?: Department;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isManager?: boolean;
}

@UseInterceptors(TimeoutInterceptor)
@UseGuards(JwtAuthorizationGuard)
@Controller('users')
export class UserController {
  logger = new Logger(UserController.name);
  constructor(
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(OwnershipGuard)
  @UseInterceptors(ExcludeNullInterceptor)
  @Inject('APP_VER')
  @Public()
  async findAll(@Query() params: ParamQueryDto) {
    const data = await this.userService.findAll(params);
    return data;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(RoleGuard)
  @Role(['ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
