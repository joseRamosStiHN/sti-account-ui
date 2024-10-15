export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  movement: string;
  accountName?:string;
}

export interface IAccount {
  code: string;
  name: string;
}

export interface IMovement {
  name: string;
  code: string;
}

export interface ClientBilling {
  id?: number;
  billingNumber: string;
  date: Date;
  currency: string;
  exchangeRate: number;
  description: string;
  status?: string;
  diaryType?:number;
}

export interface BillingListClient {
  id: number;
  document: string;
  account: string;
  dateAt: Date;
  amount: number;
  status: string;
  entryNumber: string;
  description?: string;
  creationDate?:Date;
  numberPda?:string
}

export interface ProviderClient extends ClientBilling {}
export interface BillingListProvider extends BillingListClient {}

export enum typeToast {
  Info = 'info',
  Error = 'error',
  Success = 'success',
  Warning = 'warning',
}

export enum DocumentType {
  INVOICE_CLIENT = 1,
  INVOICE_PROVIDER = 2,
  BANKS = 3,
  CREDIT_NOTE = 4,
  DEBIT_NOTE = 5,
  ADJUSTMENT = 6,
}


export interface Notes {
  id?: number;
  reference: number;
  date: Date;
  dayri: number;
  applyPorcent: string;
  percent: number;
  description: string;

}

