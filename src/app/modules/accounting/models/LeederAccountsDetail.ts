



export interface Detail {
  transactionId: number
  numberPda?: number
  accountId: number
  accountCode: string
  accountName: string
  accountTypeName: string
  accountType: number
  debit: number
  credit: number
  date: string
}
export interface LeaderAccounts {
    accountId: number
    accountName: string
    accountCode: string
    totalDebits: number
    totalCredits: number
    balance: number
    details: Detail[]
  }

 