export interface UsersResponse {
  id: number
  userName: any
  firstName: string
  lastName: string
  email: string
  userPhone: any
  userAddress:string
  createdAt: any
  globalRoles: any
  companies: any
  active: boolean
  activeRoles:boolean 
  roles?:any
}

export interface UsersRequest {
  userAddress:string
  userName: string
  firstName: string
  lastName: string
  email: string
  userPhone:string
  password?: string
  isActive: boolean
  globalRoles: GlobalRole[]
  companies: Company[]
}

export interface GlobalRole {
  id: number
}

export interface Company {
  id: number
  roles: Role[]
}

export interface Role {
  id: number
}



export interface RolesResponse {
  id: number
  name: string
  active:boolean
  activeRoles:boolean
  global:boolean
}

