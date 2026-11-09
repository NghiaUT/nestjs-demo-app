import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { type ParamQueryDto } from './user.controller.js';

function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log(`Method ${propertyKey} đã được đăng ký!`);
}
@Injectable()
export class UserService {
  private userId = 1;
  private userList: User[] = [
    {
      id: '1',
      name: 'Nghĩa',
      email: 'nghia@gmail.com',
      department: 'Support',
      age: 30,
      isManager: true,
    },
  ];

  create(createUserDto: CreateUserDto) {
    const user = new User({ id: this.userId.toString(), ...createUserDto });
    this.userList.push(user);
    this.userId += 1;
    return { user, message: 'This action create a new user' };
  }

  @Log
  findAll(params: ParamQueryDto) {
    if (!params || Object.keys(params).length === 0) {
      return this.userList;
    }

    // Chỉ lấy những key thực sự có giá trị (loại bỏ undefined)
    const validKeys = (Object.keys(params) as (keyof ParamQueryDto)[]).filter(
      (key) => params[key] !== undefined,
    );

    if (validKeys.length === 0) {
      return this.userList;
    }

    return this.userList.filter((user) =>
      validKeys.every((key) => user[key] === params[key]),
    );
  }

  findOne(id: number) {
    const user = this.userList.find((user) => user.id === id.toString());
    if (!user) throw new NotFoundException(`Không tìm thấy user với id #${id}`);
    return user ? user : `Không tìm thấy user với id #${id}`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const userIndex = this.userList.findIndex(
      (user) => user.id === id.toString(),
    );

    if (userIndex === -1) {
      return `Không tìm thấy user với id #${id}`;
    }

    this.userList[userIndex] = {
      ...this.userList[userIndex],
      ...updateUserDto,
    };

    return this.userList[userIndex];
  }

  remove(id: number) {
    const userIndex = this.userList.findIndex(
      (user) => user.id === id.toString(),
    );

    if (userIndex === -1) {
      return `Không tìm thấy user với id #${id}`;
    }

    const deletedUser = this.userList.splice(userIndex, 1);

    return {
      message: `Đã xóa thành công user #${id}`,
      deletedUser: deletedUser[0],
    };
  }
}
