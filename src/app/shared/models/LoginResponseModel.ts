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



export interface Login {
  id: number
  userName: string
  firstName: string
  lastName: string
  email: string
  createdAt: any
  globalRoles: GlobalRole[]
  companies: Company[]
  active: boolean
}

export interface GlobalRole {
  id: number
  name: string
  description: string
  global: boolean
}

export interface Company {
  id: number
  user: any
  company: CompanyInfo
  roles: Role[]
}

export interface CompanyInfo {
  id: number
  name: string
  description: string
  address: string
  rtn: string
  type: string
  email: string
  phone: string
  website: string
  tenantId: string
  createdAt: any
  companyLogo: any
  users: any
  active: boolean
}

export interface Role {
  id: number
  name: string
  description: string
  global: boolean
}
