import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { type } from 'os';
import { of, switchMap, tap } from 'rxjs';
import { AccountAPIResponse, AccountTypeResponse } from 'src/app/modules/accounting/models/APIModels';
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';




@Component({
  selector: 'app-journal-page',
  templateUrl: './journal-page.component.html',
  styleUrl: './journal-page.component.css'
})
export class JournalPageComponent {


  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  messageToast: string = '';

  JournalTypes = JournalTypes;
  journalForm: JournalModel;
  journalTypes: AccountTypeResponse[] = [];
  accounts: AccountAPIResponse[] = [];
  accountsFilter: AccountAPIResponse[] = [];
  private readonly accountService = inject(AccountService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly journalService = inject(JournalService);
  private readonly router = inject(Router);

  id: string | null = null;

  constructor() {
    this.journalForm = {
      diaryName: "",
      accountType: 0,
      defaultIncomeAccount: null,
      defaultExpenseAccount: null,
      cashAccount: null,
      lossAccount: null,
      transitAccount: null,
      profitAccount: null,
      bankAccount: null,
      accountNumber: null,
      defaultAccount: null,
      code: ''
    };

  }

  ngOnInit(): void {

    this.accountService.getAllAccount().pipe(
      tap(data => {
 
        this.accounts = data.filter(account => account.supportEntry === true);
      }),
      switchMap(() => this.activeRouter.paramMap), 
      switchMap(params => {
        this.id = params.get('id');
        const findId = Number(this.id);
    
        if (findId) {
        
          return this.journalService.getJournalById(findId);
        } else {
        
          return of(null);
        }
      })
    ).subscribe(journal => {
 
      if (journal) {
        this.loadAccountsOnEdit(journal);
      }
    });

    this.journalService.getAllAccountType().subscribe({
      next: (data) => {
        this.journalTypes = data;
      }
    });


  }

  onSubmit(e: NgForm) {

    if (this.id) {
      this.journalService.updateJournal(Number(this.id), this.journalForm).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Registros actualizados exitosamente';
          this.showToast = true;
          setTimeout(() => {
            this.goBack();
          }, 1000);
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al actualizar Diario';
          this.showToast = true;
        },
      });

      return
    }

    if (e.valid) {

      this.journalService.createJoural(this.journalForm).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Registros insertados exitosamente';
          this.showToast = true;
          this.router.navigate(['/accounting/configuration/journal-list']);
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al crear la transacción';
          this.showToast = true;
        },
      });

    }

  }

  onChangeType(e: any) {
    if (e.target.value == JournalTypes.Ventas) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Ventas);
      return;
    }

    if (e.target.value == JournalTypes.Compras) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Compras);
      return;
    }

    if (e.target.value == JournalTypes.Varios) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Varios);
      return;
    }

    if (e.target.value == JournalTypes.Bancos) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Bancos);
      return;
    }
    if (e.target.value == JournalTypes.Efectivo) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Efectivo);
      return;
    }


  }
   loadAccountsOnEdit(journal: JournalModel) {

    this.journalForm = journal;

    if (journal.accountType == JournalTypes.Ventas) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Ventas);
      return;
    }

    if (journal.accountType == JournalTypes.Compras) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Compras);
      return;
    }

    if (journal.accountType == JournalTypes.Varios) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Varios);
      return;
    }

    if (journal.accountType == JournalTypes.Bancos) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Bancos);
      return;
    }
    if (journal.accountType == JournalTypes.Efectivo) {
      this.accountsFilter = this.accounts.filter(account => account.accountType == JournalTypes.Efectivo);
      return;
    }
  }

  goBack() {
    this.router.navigate(['/accounting/configuration/journal-list']);
  }



}
