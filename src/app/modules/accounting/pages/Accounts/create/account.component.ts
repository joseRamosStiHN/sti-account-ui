import { Component, inject, OnInit } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/AccountModel';
import {
  AccountAPIResponse,
  AccountCategories,
  AccountTypeResponse,
} from '../../../models/APIModels';
import { error } from 'console';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';

interface Account {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  accountPrefix: string = '';
  id: string | null = null;
  accountForm: AccountModel = {
    description: '',
    code: '',
    accountType: 0,
    status: 'ACTIVO',
    balances: [{
      typicalBalance: "",
      initialBalance: 0,
      isCurrent: true,
    }
    ],
  };
  accounts: Account[] = [];
  categories!: AccountCategories[];
  accountTypes!: AccountTypeResponse[];


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  accountFatherIsRequired: boolean = false;

  private readonly activeRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  constructor() { }

  ngOnInit(): void {
    this.accountService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Error al obtener datos', err),
    });

    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        data = data.filter(account => account.supportEntry == false);

        this.fillAccounts(data)
      }
    });

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {
        this.accountService.findAccountById(findId).subscribe({
          next: (data) => this.fillForm(data),
          error: (err) => console.error('error: we got ', err),
        });

        this.accountService.getAllAccountType().subscribe({
          next: (data) => {
            this.accountTypes = data;
          }
        });

      }
    });
  }

  onSubmit(e: NgForm) {
    if (e.valid) {
      if (!this.id) {
        this.createAccount();
        return;
      }
      this.updateAccount();
    }
  }


  private createAccount(): void {

    if (this.accountForm.parentId) {
      this.accountForm.code = this.accountPrefix + '-' + this.accountForm.code;
    }
    if (!this.accountFatherIsRequired) {
      this.accountForm.balances = [];
    }
    const { accountType, ...accountFormWithoutType } = this.accountForm;

    this.accountService.createAccount(accountFormWithoutType).subscribe({
      next: (result) => {
        this.router.navigate(['accounting/configuration']);
      },
      error: (err) => {
        this.toastType = typeToast.Error;
        this.messageToast = 'No se pudo crear la cuenta';
        if (err.error[0].message == 'The account code already exists.') {
          this.toastType = typeToast.Warning
          this.messageToast = 'El codigo de la cuenta ya existe.';
        }
        this.showToast = true;
      }
    });
  }

  private updateAccount(): void {
    this.accountService
      .updateAccount(Number(this.id), this.accountForm)
      .subscribe(() => {
        this.router.navigate(['accounting/configuration']);
      });
  }

  private fillForm(data: AccountAPIResponse): void {
    this.accountForm.id = data.id;
    this.accountForm.category = data.categoryId;
    this.accountForm.code = data.accountCode;
    this.accountForm.description = data.name;
    if (data.typicallyBalance.toUpperCase() === 'CREDITO') {
      this.accountForm.typicalBalance = 'C';
    } else {
      this.accountForm.typicalBalance = 'D';
    }
    this.accountForm.supportsRegistration = data.supportEntry;
    this.accountForm.parentId = data.parentId;
    this.accountPrefix = data.parentCode ?? '';
    this.accountForm.isActive =
      data.status.toUpperCase() === 'ACTIVA' ? true : false;
    this.accountForm.balances = data.balances;
    this.accountForm.accountType = data.accountType;

   this.accountFatherIsRequired = data.supportEntry;
   

  }

  private fillAccounts(data: AccountAPIResponse[]): void {
    const result = data.map((v) => {
      return { id: v.id, code: v.accountCode, name: v.name } as Account;
    });

    if (this.id) {
      const findId = Number(this.id);
      this.accounts = result.filter((account) => account.id !== findId);
      return;
    }
    this.accounts = result;


  }

  onValueChange(id: number): void {
    const account = this.accounts.find((data) => data.id == id);
    if (account?.id) {
      this.accountPrefix = account.code;
    }
  }

  onValueStatus(event: any) {
    this.accountFatherIsRequired = event.target.value === 'true' ? true : false;

    if (this.accountFatherIsRequired) {
      this.accountService.getAllAccountType().subscribe({
        next: (data) => {
          this.accountTypes = data;
        }
      });
    }

  }

  validateDecimal(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.charCode);
    const currentValue = (event.target as HTMLInputElement).value;

    if (!/^\d*\.?\d*$/.test(inputChar)) {
      event.preventDefault();
      return;
    }

    if (inputChar === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }
    if (currentValue.includes('.') && currentValue.split('.')[1].length >= 2) {
      event.preventDefault();
    }
  }


}
