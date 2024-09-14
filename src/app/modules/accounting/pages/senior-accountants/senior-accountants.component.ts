import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { LeaderAccounts } from 'src/app/modules/accounting/models/LeederAccountsDetail';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

interface LocalSeniorAccount {
  id: number;
  date: string;
  diary: string; // este es Número de Factura proveedor | cliente | banco | Varios etc...
  account: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}



@Component({
  selector: 'app-senior-accountants',
  templateUrl: './senior-accountants.component.html',
  styleUrl: './senior-accountants.component.css'
})
export class SeniorAccountantsComponent {



  tranactionList$: LocalSeniorAccount[] = []
  loadingData: boolean = true;
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.transactionService.getAllLedgerAcounts().subscribe((data) => {

      this.tranactionList$ = this.fillDataSource(data);

    }

    );
  }


  goBack() {
    window.history.back();
  }


  fillDataSource(data: LeaderAccounts[]): LocalSeniorAccount[] {
    const result: LocalSeniorAccount[] = [];
  
    data.forEach((diary) => {
      diary.transactions.forEach((transaction) => {
        transaction.transactionsDetail.forEach((detail) => {
          const debit = detail.entryType === "Debito" ? detail.amount : 0;
          const credit = detail.entryType === "Credito" ? detail.amount : 0;
  
          const localSeniorAccount: LocalSeniorAccount = {
            id: diary.diaryId,
            diary: diary.diaryName,
            date: transaction.date,
            account: detail.accountName,
            reference: "",
            debit,
            credit,
            balance: debit - credit
          };
  
          result.push(localSeniorAccount);
        });
      });
    });
  
    return result;
  }







}
