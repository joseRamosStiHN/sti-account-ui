import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

interface LocalJournalItem {
  id: number;
  date?: Date;
  journalEntry?: string; 
  defaultAccount?: string;
  numberPad:string;
  reference?: string;
  description?:string;
  debit?: number;
  credit?: number;
  balance?: number;
}

@Component({
  selector: 'app-journal-items',
  templateUrl: './journal-items.component.html',
  styleUrl: './journal-items.component.css',
})
export class JournalItemsComponent implements OnInit {
  data$: Observable<LocalJournalItem[] | null> = new BehaviorSubject(null);
  private readonly transService = inject(TransactionService);

  dataTable: LocalJournalItem[] = [];

  ngOnInit(): void {
    this.transService.getAllJournalEntries().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });

  }


  fillDataSource(data: any): LocalJournalItem[] {
    const result: LocalJournalItem[] = [];

   

    
    data.transactions.forEach((item: any) => {
      item.transactionDetails.forEach((transaction: any) => {
        const debito = transaction.entryType === 'Credito' ? 0 : transaction.amount;
        const credito = transaction.entryType === 'Debito' ? 0 : transaction.amount;
        const localJournalItem: LocalJournalItem = {
          id: item.id,
          reference: "Transaccion Contable",
          date: item.creationDate,
          journalEntry:item.diaryName,
          defaultAccount: `${transaction.accountName} ${transaction.accountCode}`,
          numberPad:item.numberPda,
          description: item.description,
          debit: debito,
          credit: credito,
          balance: Number((debito - credito).toFixed(2)),
        };
        result.push(localJournalItem);
      });
    });

    data.adjustments.forEach((item: any) => {
      item.adjustmentDetails.forEach((transaction: any) => {
        const debito =  transaction.shortEntryType =="D"? transaction.amount : 0;
        const credito = transaction.shortEntryType =="C"? transaction.amount : 0;
        const localJournalItem: LocalJournalItem = {
          id: item.id,
          reference: item.reference,
          date: item.creationDate,
          journalEntry:item.diaryName,
          defaultAccount: `${transaction.accountName} ${transaction.accountCode}`,
          numberPad:item.numberPda,
          description: item.description,
          debit: debito,
          credit: credito,
          balance: Number((debito - credito).toFixed(2)),
        };
        result.push(localJournalItem);
      });
    });

    data.debitNotes.forEach((item: any) => {
      item.detailNote.forEach((transaction: any) => {
        const debito =  transaction.shortEntryType =="D"? transaction.amount : 0;
        const credito = transaction.shortEntryType =="C"? transaction.amount : 0;
        const localJournalItem: LocalJournalItem = {
          id: item.id,
          reference: item.reference,
          date: item.creationDate,
          journalEntry:item.diaryName,
          defaultAccount: `${transaction.accountName} ${transaction.accountCode}`,
          numberPad:item.numberPda,
          description: item.description,
          debit: debito,
          credit: credito,
          balance: Number((debito - credito).toFixed(2)),
        };
        result.push(localJournalItem);
      });
    });

    data.creditNotes.forEach((item: any) => {
      item.detailNote.forEach((transaction: any) => {
        const debito =  transaction.shortEntryType =="D"? transaction.amount : 0;
        const credito = transaction.shortEntryType =="C"? transaction.amount : 0;
        const localJournalItem: LocalJournalItem = {
          id: item.id,
          reference: item.reference,
          date: item.creationDate,
          journalEntry:item.diaryName,
          defaultAccount: `${transaction.accountName} ${transaction.accountCode}`,
          numberPad:item.numberPda,
          description: item.description,
          debit: debito,
          credit: credito,
          balance: Number((debito - credito).toFixed(2)),
        };
        result.push(localJournalItem);
      });
    });

    return result;

  }

  
}
