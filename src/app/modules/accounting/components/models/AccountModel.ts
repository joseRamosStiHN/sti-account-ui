export interface AccountModel {
  id?: number;
  code?: string;
  description?: string;
  parentId?: number;
  category?: number;
  typicalBalance?: string | null;
  supportsRegistration?: boolean | null;
  status: string;
  isActive?: boolean;
  balances: BalancesModel[];
}

export interface BalancesModel {
    id: number;
    initialBalance: number;
    createAtDate: string;
    isActual: boolean;
}
