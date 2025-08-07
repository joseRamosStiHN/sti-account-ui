export interface GeneralBalance {
  id: number;
  parentId: number | null;
  accountName: string;
  category: string;
  amount: number;
  total: number | null;
  root: boolean;
}

export interface GeneralBalanceResponse {
  accountId: number
  accountName: string
  parentId?: number
  category: string
  balance: number
  root: boolean
}

export interface TransactionDetailResponse {
  id: number;
  accountCode: string;
  accountId: number;
  accountName: string;
  amount: number;
  entryType: string;
  shortEntryType: string;
}

export interface TransactionResponse {
  id: number;
  reference: string;
  status: string;
  exchangeRate: number;
  entryNumber: number | null;
  documentName: string;
  description: string;
  date: Date;
  creationDate: Date;
  currency: string;
  transactionDetails: TransactionDetailResponse[];
  diaryType:number;
  numberPda?:string
  documentType:number 
  typeSale:string;
  cashValue?:number;
  creditValue?:number;
  typePayment:string;
  rtn:string;
  supplierName:string;
}

export interface AccountCategories {
  id: number;
  name: string;
}

export interface AccountAPIResponse {
  accountCode: string;
  accountType: number;
  balances: any[];
  categoryId: number;
  categoryName: string;
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
  parentCode: string | null;
  typicallyBalance: string;
  status: string;
  supportEntry: boolean;
  asTransaction:boolean;
  hasChildAccounts:boolean;
}

export interface APIGeneralBalanceReportResponse {
  data: GeneralBalance[];
}

export interface PeriodsResponse {
  id: number;
  description: string;
  startDate: Date;
  endDate: Date;
  closureType: string;
  status: string;
}

export interface PeriodsRequest {
  id?: number;
  description: string;
  startDate: Date;
  endDate: Date;
  closureType: string;
  status: string;
}

export interface AccountTypeResponse {
  id: number;
  name: string;
}


export interface AdjustmentRequest {
  transactionId: number
  reference: string
  descriptionAdjustment:string
  detailAdjustment: DetailAdjustment[]
}

export interface DetailAdjustment {
  accountId: number

}

export interface AdjustmentResponse {
  id: number
  transactionId: number
  reference: string
  status: string
  creationDate: any
  invoiceNo:string
  adjustmentDetails: AdjustmentDetail[]
}

export interface AdjustmentDetail {
  id: number
  accountId: number
  accountName: string
  accountCode: string
  amount: number
  entryType: string
  shortEntryType: string
}


// export interface TrialBalaceResponse {
//   id: number
//   periodName: string
//   closureType: string
//   startPeriod: string
//   endPeriod: string
//   balanceDiaries: BalanceDiary[]
// }

// export interface BalanceDiary {
//   diaryName: string
//   initialBalance: InitialBalance[]
//   balancePeriod: BalancePeriod[]
//   finalBalance: FinalBalance[]
// }

export interface InitialBalance {
  debit: number
  credit: number
}

export interface BalancePeriod {
  debit: number
  credit: number
}

export interface FinalBalance {
  debit: number
  credit: number
}

export interface IncomeStatement {
  id: number
  category?: string
  accountParent?: string
  account: string
  amount: number
  date: Date
}

export interface AdjustmentResponseById{
  id: number
  transactionId: number
  reference: string
  descriptionAdjustment: any
  invoiceNo: string
  diaryName: string
  numberPda: string
  status: string
  creationDate: string
  adjustmentDetails: AdjustmentDetailById[]
}

export interface AdjustmentDetailById {
  id: number
  accountId: number
  accountName: string
  accountCode: string
  amount: number
  entryType: string
  shortEntryType: string
  typicalBalance: string
  initialBalance: number
}




export interface SeniorAccounts {
  name: string
  code: string
  fatherAccount: string
  typeAccount: string
  totalDebit: number
  totalCredit: number
  balance: number
  transaction: Transaction[]
}

export interface Transaction {
  name: string
  motion: string
  numberPda: number
  debitAmount: number
  creditAmount: number
  balance: number
  date: string
}


export interface PeriodClosing {
  periodName: any
  typePeriod: string
  startPeriod: string
  endPeriod: string
  totalAssets: number
  totalLiabilities: number
  totalCapital: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
}



export interface TrialBalaceResponse {
  periods: Period[]
}

export interface Period {
  id: number
  periodName?: string
  closureType: string
  startPeriod: string
  endPeriod: string
  accountBalances: AccountBalance[]
}

export interface AccountBalance {
  id:number
  name: string
  accountCode: string
  parentName: string
  parentId: number
  initialBalance: InitialBalance[]
  balancePeriod: BalancePeriod[]
  finalBalance: FinalBalance[]
}

export interface InitialBalance {
  debit: number
  credit: number
}

export interface BalancePeriod {
  debit: number
  credit: number
}

export interface FinalBalance {
  debit: number
  credit: number
}



export interface TaxSettings {
  id?:number
  taxRate: string
  type: string
  fromValue: number | null
  toValue: number | null
  percent?: number | null
  isCurrent: boolean
  creationDate?:string
}


export interface UploadBulkSettings {
  id: number
  name: string
  activate: boolean
  type: number
  rowInit: number
  tenantId: string
  configDetails: ConfigDetail[]
}

export interface ConfigDetail {
  colum: number
  title: string
  account?: number
  operation?: string
  bulkTypeData: string
}


export interface TransactionUpload {
  typeTransaction:number
  data: Daum[]
  errors: any[]
}

export interface Daum {
  id:string
  row:number
  date: string
  currency: any
  description: string
  errors: any
  reference: string
  status: string
  exchangeRate: any
  typeSale: string
  cashValue: number
  creditValue: number
  typePayment: string
  rtn: string
  supplierName: any
  accounts: Account[]
  otherFields: any
}

export interface Account {
  title: string
  account: number
  debit: number
  credit: number
}


