import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserMongo, UserSchema } from '../schemas/user.schema.js';
import { Model, QueryFilter, Types } from 'mongoose';
import { User } from '../types/user.type.js';
import { Department } from '../entities/user.entity.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ParamQueryDto } from '../user.controller.js';

// interface UserRow extends User {
//     passwordHash: string | null;
// }

type CreateUser = {
  name: string;
  email: string;
  age: number;
  department: Department;
  isManager: boolean;
  passwordHash: string;
};

const toUser = (user: UserMongo, id: Types.ObjectId): User => {
  const { passwordHash, balance, ...returnUser } = user;
  return { id: String(id), ...returnUser };
};
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserMongo.name) private userModel: Model<UserMongo>,
  ) {}

  async create(createUser: CreateUser): Promise<User> {
    const createdUser = new this.userModel({
      ...createUser,
      balance: 0,
    });
    const savedUser = (await createdUser.save()).toObject();
    return toUser(savedUser, savedUser._id);
  }

  async findAll(
    params: ParamQueryDto,
    page: number = 1,
    limit: number = 10,
  ): Promise<User[]> {
    const filter: QueryFilter<UserMongo> = {};

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
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return users.map((u) => toUser(u, u._id));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).lean().exec();
    return user ? toUser(user, user._id) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email }).lean().exec();
    return user ? toUser(user, user._id) : null;
  }

  async findCredentials(
    email: string,
  ): Promise<{ user: User; passwordHash: string | null } | null> {
    const user = await this.userModel.findOne({ email: email }).lean().exec();
    return user
      ? { user: toUser(user, user._id), passwordHash: user.passwordHash }
      : null;
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
  ): Promise<User | null> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { passwordHash },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
    return user ? toUser(user, user._id) : null;
  }

  async update(id: string, updateUser: UpdateUserDto): Promise<User | null> {
    const updateData = {
      name: updateUser.name,
      age: updateUser.age,
      department: updateUser.department,
    };

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
    return user ? toUser(user, user._id) : null;
  }

  async delete(id: string): Promise<number> {
    const deletedUser = await this.userModel.deleteOne({ _id: id }).exec();
    return deletedUser.deletedCount;
  }
}
