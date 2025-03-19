export interface CompanyResponse {
    id: number
    name: string
    description: string
    address: string
    rtn: string
    type: string
    email: string
    phone: string
    website: any
    tenantId: any
    createdAt: any
    roles: any
    active: boolean
    permissions:number[]
  }

  export interface CompanyRequest {
    name: string
    description: string
    address: string
    rtn: string
    type: string
    email: string
    phone: string
    website: string
    isActive: boolean
    companyLogo: string
    users: User[]
    tenantId?:string
  }
  
  export interface User {
    id: number
    roles: Role[]
  }
  
  export interface Role {
    id: number
  }
  
  export interface companyByUser {
    pageSize: number
    totalPages: number
    pageNumber: number
    response: CompanieResponse[]
  }
  
  export interface CompanieResponse {
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
    createdAt: string
    roles: Role[]
    active: boolean
  }
  
  export interface Role {
    id: number
    name: string
    description: string
    global: boolean
  }
  
