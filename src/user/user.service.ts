import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { type ParamQueryDto } from './user.controller.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema.js';
import { Model, QueryFilter } from 'mongoose';

function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log(`Method ${propertyKey} đã được đăng ký!`);
}
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = (await createdUser.save()).toObject();

    const { password, ...user } = savedUser;
    return {
      user,
      message: 'This action create a new user',
    };
  }

  @Log
  async findAll(params: ParamQueryDto) {
    const filter: QueryFilter<User> = {};

    if (params.name) {
      filter.name = { $regex: params.name, $options: 'i' };
    }

    if (params.age) {
      filter.age = params.age;
    }

    if (params.department) {
      filter.department = params.department;
    }

    if (params.isManager !== undefined) {
      filter.isManager = params.isManager;
    }

    return this.userModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`Không tìm thấy user với id #${id}`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { runValidators: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id #${id}`);
    }

    return user;
  }

  async remove(id: string) {
    const removeUser = await this.userModel.deleteOne({ _id: id }).exec();

    if (removeUser.deletedCount === 0) {
      return `Không tìm thấy user với id #${id}`;
    }

    return {
      message: `Đã xóa thành công user #${id}`,
    };
  }

  async findWithEmail(email: string) {
    const user = await this.userModel
      .findOne({ email: email })
      .select('-password')
      .exec();

    return user;
  }
}
