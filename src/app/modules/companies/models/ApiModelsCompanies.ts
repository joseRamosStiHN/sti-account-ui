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
    id?: number
    name: string
    description: string
    address: string
    rtn: string
    type: string
    email: string
    phone: string
    website?: any
    tenantId?: any
    createdAt?: any
    roles?:any
    userIds?:number[]
    isActive: boolean
    permissions:number[]
    role?:any
  }
  
  