export interface TransactionModel {
  id?: number;
  createAtDate: Date;
  reference: string;
  documentType: number;
  exchangeRate: number;
  descriptionPda: string;
  currency: string;
  diaryType?:number;
  typeSale:string;
  cashValue?:number;
  creditValue?:number;
  typePayment:string;
  rtn:string;
  supplierName:string;
  detail: TransactionDetailModel[];
}

export interface TransactionDetailModel {
  id?: number;
  accountId: number;
  amount: number;
  motion: string;
}
