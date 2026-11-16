import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { type ParamQueryDto } from './user.controller.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema.js';
import { Model, QueryFilter } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../order/entity/order.entity.js';
import { Repository } from 'typeorm';
import { UserRepository } from './repositories/user.repository.js';

function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log(`Method ${propertyKey} đã được đăng ký!`);
}
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async create(createUserDto: CreateUserDto, passwordHash: string) {
    return await this.userRepository.create({ ...createUserDto, passwordHash });
  }

  @Log
  async findAll(params: ParamQueryDto, page: number = 1, limit: number = 10) {
    return this.userRepository.findAll(params, page, limit);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    console.log(user);
    if (!user) throw new NotFoundException(`Không tìm thấy user với id #${id}`);
    const orders = await this.orderRepo.find({
      where: { customerName: user.name },
    });
    return { user, orders };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id #${id}`);
    }

    return user;
  }

  async remove(id: string) {
    const deletedCount = await this.userRepository.delete(id);

    if (deletedCount === 0) {
      return `Không tìm thấy user với id #${id}`;
    }

    return {
      message: `Đã xóa thành công user #${id}`,
    };
  }

  async findWithEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với email:  ${email}`);
    }
    return user;
  }
}
