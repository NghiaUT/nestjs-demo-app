export type Department = 'IT' | 'Sales' | 'Support';

export class User {
  id: string;
  name: string;
  email: string;
  age: number;
  department: Department;
  isManager: boolean;

  constructor(init?: Partial<User>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.email = init?.email ?? '';
    this.age = init?.age ?? 0;
    this.department = init?.department ?? 'Support';
    this.isManager = init?.isManager ?? false;
  }
}
