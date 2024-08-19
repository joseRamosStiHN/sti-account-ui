export interface JournalModel {
    id?: number;
    name: string;
    type: string;
    code: string;
    accountPredeterminate: string;
    accountCash:string;
    transitAccount:string;
    lossAccount:string;
    profitAccount:string;
    bankAccount:string;
    accountNumber:string;
    status: boolean;
  }
  