



export interface LeaderAccounts {
  diaryId: number
  diaryName: string
  transactions: Transaction[]
}

export interface Transaction {
  id: number
  description: string
  reference: string
  creationDate: string
  date: string
  transactionsDetail: TransactionsDetail[]
}

export interface TransactionsDetail {
  id: number
  entryType: string
  shortEntryType: string
  accountCode: string
  accountName: string
  amount: number
}

