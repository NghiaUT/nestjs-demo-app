import { Department } from '../entities/user.entity.js';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  department: Department;
  isManager: boolean;
}
