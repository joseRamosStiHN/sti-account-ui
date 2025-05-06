export interface TransactionModel {
  id?: number;
  createAtDate: Date;
  reference: string;
  documentType: number;
  exchangeRate: number;
  descriptionPda: string;
  currency: string;
  diaryType?:number;
  typeSale:string | null;
  cashValue?:number;
  creditValue?:number;
  typePayment:string | null;
  rtn:string | null;
  supplierName:string | null;
  detail: TransactionDetailModel[];
}

export interface TransactionDetailModel {
  id?: number;
  accountId: number;
  amount: number;
  motion: string;
}
