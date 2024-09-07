export interface JournalModel {
  diaryName: string
  accountType: number
  accountTypeName?:string | null,
  defaultIncomeAccount?: number | null
  defaultExpenseAccount?: number | null
  cashAccount?: number | null
  lossAccount?: number | null
  transitAccount?: number | null
  profitAccount?: number | null
  bankAccount?: number | null
  accountNumber?: number | null
  defaultAccountName?:string | null;
  defaultAccount?: number | null
  cashAccountName?:string | null;
  bankAccountName?:string | null
  code: string
}


export enum JournalTypes {
  Ventas = 1,
  Compras = 2,
  Efectivo = 3,
  Bancos = 4,
  Varios = 5
}
  