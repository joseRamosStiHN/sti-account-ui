export interface TransactionModel {
  id?: number;
  createAtDate: Date;
  reference: string;
  documentType: number;
  exchangeRate: number;
  descriptionPda: string;
  currency: string;
  detail: TransactionDetailModel[];
}

export interface TransactionDetailModel {
  id?: number;
  accountId: number;
  amount: number;
  motion: string;
}
