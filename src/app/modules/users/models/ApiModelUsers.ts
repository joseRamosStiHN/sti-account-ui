export interface UsersResponse {
  id: number
  userName: any
  firstName: string
  lastName: string
  email: string
  phoneNumber: any
  createdAt: any
  roles: any
  companies: any
  active: boolean
}

export interface UsersRequest {


  userName: any
  firstName: string
  lastName: string
  email: string
  phoneNumber: any
  roles: any
  companies: any
  active: boolean
  
}


export interface RolesResponse {
  id: number
  name: string
  active:boolean
}

