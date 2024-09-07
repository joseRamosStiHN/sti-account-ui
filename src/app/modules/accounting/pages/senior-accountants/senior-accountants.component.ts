import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { AccountAPIResponse } from 'src/app/modules/accounting/models/APIModels';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { Detail, LeaderAccounts } from 'src/app/modules/accounting/models/LeederAccountsDetail';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';



@Component({
  selector: 'app-senior-accountants',
  templateUrl: './senior-accountants.component.html',
  styleUrl: './senior-accountants.component.css'
})
export class SeniorAccountantsComponent {

  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  searchEnabled = true;

  editorOptions = { placeholder: 'Search column' };

  allowSelectAll = true;

  selectByClick = true;

  recursive = true;

  columnChooserModes = [{
    key: 'dragAndDrop',
    name: 'Drag and drop',
  }, {
    key: 'select',
    name: 'Select',
  }];



  tranactionList$: LeaderAccounts[] =[]

  loadingData: boolean = true;
  /*injections */
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
     this.transactionService.getAllLedgerAcounts().subscribe((data)=>

       this.tranactionList$ = data
      );
  }

  onEditAccount(e: Detail) {

    if (e.accountType == JournalTypes.Ventas) {
      this.router.navigate(['/accounting/client-invoicing',e.transactionId]);
    }

    if (e.accountType == JournalTypes.Compras) {
      this.router.navigate(['/accounting/provider-invoicing',e.transactionId]);
    } 

  }

  goToNewAccount = () => {
    this.router.navigate(['/accounting/configuration/new-account']);
  };

  see(data: any) {

    console.log(data);

  }

  goBack() {
    window.history.back();
   }

 

 

}
