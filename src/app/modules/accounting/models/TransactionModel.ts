export interface TransactionModel {
  id?: number;
  createAtDate: Date;
  reference: string;
  documentType: number;
  exchangeRate: number;
  descriptionPda: string;
  currency: string;
  diaryType?:number;
  detail: TransactionDetailModel[];
}

export interface TransactionDetailModel {
  id?: number;
  accountId: number;
  amount: number;
  motion: string;
}
