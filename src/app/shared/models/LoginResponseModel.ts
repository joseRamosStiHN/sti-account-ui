export interface Login {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  roles: Role[];
  companies: Company[];
  active: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isGlobal: boolean;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
  rtn: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  tenantId: string;
  createdAt: Date;
  roles: Role[];
  active: boolean;
}
