export interface GeneralBalance {
  id: number;
  parentId: number | null;
  accountName: string;
  category: string;
  amount: number;
  total: number | null;
  root: boolean;
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
  detailAdjustment: DetailAdjustment[]
}

export interface DetailAdjustment {
  accountId: number
  amount: number
  motion: string
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

