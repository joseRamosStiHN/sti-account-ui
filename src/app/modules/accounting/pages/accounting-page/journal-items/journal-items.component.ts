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
    this.transService.getAll().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });

  }


  fillDataSource(data: any[]): LocalJournalItem[] {
    const result: LocalJournalItem[] = [];

    
    data.forEach((item: any) => {
      item.transactionDetails.forEach((transaction: any) => {
        const debito = transaction.entryType === 'Credito' ? 0 : transaction.amount;
        const credito = transaction.entryType === 'Debito' ? 0 : transaction.amount;
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
