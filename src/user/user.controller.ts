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
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { type Response } from 'express';
import { type Department } from './entities/user.entity.js';

import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { JwtAuthorizationGuard } from '../guards/jwt-auth.guard.js';
import { OwnershipGuard } from '../guards/ownership.guard.js';
import { TimeoutInterceptor } from '../interceptors/timeout.interceptor.js';
import { ExcludeNullInterceptor } from '../interceptors/exclude-null.interceptor.js';

export class ParamQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(['IT', 'Sales', 'Support'])
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
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(OwnershipGuard)
  @UseInterceptors(ExcludeNullInterceptor)
  async findAll(@Query() params: ParamQueryDto, @Res() response: Response) {
    this.logger.log(`Method name: ${this.findAll.name}`);
    const data = await this.userService.findAll(params);
    response.status(200).json(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
