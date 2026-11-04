import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UserService {
  private userId = 1;
  private userList: User[] = [];

  create(createUserDto: CreateUserDto) {
    const user = new User({ id: this.userId.toString(), ...createUserDto });
    this.userList.push(user);
    this.userId += 1;
    return 'This action adds a new user';
  }

  findAll() {
    return this.userList;
  }

  findOne(id: number) {
    const user = this.userList.find((user) => user.id === id.toString());
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
