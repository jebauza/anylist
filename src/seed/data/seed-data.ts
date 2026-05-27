import { ValidRoles } from './../../auth/enums/valid-roles.enum';

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  roles?: ValidRoles[];
  isActive?: boolean;
}

interface SeedItem {
  name: string;
  unit?: string;
}

interface SeedData {
  users: SeedUser[];
  items: SeedItem[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'admin@test.com',
      password: 'Abc123',
      fullName: 'Admin',
      roles: [ValidRoles.admin],
      isActive: true,
    },
    {
      email: 'superUser@test.com',
      password: 'Abc123',
      fullName: 'SuperUser',
      roles: [ValidRoles.superUser],
      isActive: true,
    },
    {
      email: 'user@test.com',
      password: 'Abc123',
      fullName: 'User',
      roles: [ValidRoles.user],
      isActive: true,
    },
    {
      email: 'test@test.com',
      password: 'Abc123',
      fullName: 'Test',
    },
  ],

  items: [
    { name: 'meat', unit: 'kg' },
    { name: 'milk', unit: 'liters' },
    { name: 'bread', unit: 'units' },
    { name: 'eggs', unit: 'dozens' },
    { name: 'rice', unit: 'kg' },
    { name: 'oil', unit: 'liters' },
    { name: 'sugar', unit: 'kg' },
    { name: 'salt', unit: 'grams' },
    { name: 'chicken', unit: 'kg' },
    { name: 'apples', unit: 'kg' },
    { name: 'donuts', unit: '' },
  ],
};
