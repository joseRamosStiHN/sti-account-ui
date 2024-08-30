export interface AccountModel {
  id?: number;
  code?: string;
  description?: string;
  parentId?: number | null;
  category?: number;
  typicalBalance?: string | null;
  supportsRegistration?: boolean | null;
  status: string;
  isActive?: boolean;
  balances: BalancesModel[];
}

export interface BalancesModel {
  id?: number;
  accountId:number;
  initialBalance: number;
  createAtDate: Date;
  isActual: boolean;
  typicalBalance:string
}
