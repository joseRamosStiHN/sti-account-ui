export interface TransactionModel {
  createAtDate: Date;
  reference: string;
  documentType: number;
  exchangeRate: number;
  descriptionPda: string;
  currency: string;
  detail: TransactionDetailModel[];
}

export interface TransactionDetailModel {
  accountId: number;
  amount: number;
  motion: string; 
}
