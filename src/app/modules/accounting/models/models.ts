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
  typePayment:string;
  methodPayment:string;
  rtn:string;
  supplierName:string
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


export enum bulkTypeData{

}

export enum BulkDetailType {
  ACC="ACC",    // account
  DT="DT",     // DateTime
  N="N",      // number
  S="S",      // string
  D="D",      // Decimal
  B="B",      // Boolean
}


export enum typeToast {
  Info = 'info',
  Error = 'error',
  Success = 'success',
  Warning = 'warning',
}

export enum DocumentType {
  INVOICE_CLIENT = 1,
  INVOICE_PROVIDER = 2,
  CREDIT_NOTE = 3,
  DEBIT_NOTE = 4,
  VARIOUS_OPERATIONS = 5
}


export interface Notes {
  id?: number;
  reference: number;
  date: Date;
 dayri: number | null;
  applyPorcent: string;
  percent: number;
  description: string;

}


export interface UploadBulkSettingsModel {
  id?: number
  name: string 
  type: number | null
  rowInit: number | null,
  configDetails:ConfigDetailModel[]
}

export interface ConfigDetailModel {
  colum: number | null
  title: string
  account: number | null
  operation: string | null
  bulkTypeData: BulkDetailType
  
}




export interface ClosingPeriodsAll {
  accountingPeriodId: number
  periodName: any
  typePeriod: any
  startPeriod: string
  endPeriod: string
  totalAssets: number
  totalLiabilities: number
  totalCapital: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
}


export interface NextPeridModel {
  id?: number
  periodName?: string
  closureType: string
  startPeriod: string
  endPeriod: string
  daysPeriod: number
  periodStatus?: string
  periodOrder?: number
  isAnnual?: boolean
}
