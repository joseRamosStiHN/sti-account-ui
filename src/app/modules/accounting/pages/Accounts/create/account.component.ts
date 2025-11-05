import { Component, inject, Input, OnInit } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/AccountModel';
import {
  AccountAPIResponse,
  AccountCategories,
  AccountTypeResponse,
} from '../../../models/APIModels';
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
  // input para obtener el id del path param.
  @Input("id") id?: string;

  accountPrefix: string = '';

  accountForm: AccountModel = {
    description: '',
    code: '',
    accountType: null,
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

  hasTransaction: boolean = false;
  hasChildAccounts: boolean = false;


  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  constructor() { }

  ngOnInit(): void {
    this.accountService.getCategories().subscribe({
      next: (data) => (
        this.categories = data),
      error: (err) => {

        this.toastType = typeToast.Error;
        this.messageToast = 'Ups error al obtener categorias';
        this.showToast = true;
        console.error('Error al obtener datos categorias', err)
        this.redirectTo();

      },
    });

    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        data = data.filter(account => account.supportEntry == false);
        this.fillAccounts(data)
      },
      error: (err) => {
        this.toastType = typeToast.Error;
        this.messageToast = 'Ups error al obtener las cuentas';
        this.showToast = true;
        console.error('Error al obtener datos de cuentas', err)
        this.redirectTo();
      }
      ,
    });

    const findId = Number(this.id);
    if (findId) {
      this.accountService.findAccountById(findId).subscribe({
        next: (data) => this.fillForm(data),
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = 'Ups error no se pude obtener para editar.';
          this.showToast = true;
          console.error('Error al obtener datos para editar', err)
          this.redirectTo();
        },
      });
      this.accountService.getAllAccountType().subscribe({
        next: (data) => {
          this.accountTypes = data;
        }
      });

    }
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

    let code: string = "";

    if (this.accountForm.parentId) {
      code = this.accountPrefix + '-' + this.accountForm.code;
      this.accountForm.code = code;
    }
    if (!this.accountFatherIsRequired) {
      this.accountForm.balances = [];
    }
    const { accountType, ...accountFormWithoutType } = this.accountForm;
    let request;
    if (accountType == 0) {
      request = accountFormWithoutType;
    } else {
      request = this.accountForm
    }

    this.accountService.createAccount(request).subscribe({
      next: (result) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Cuenta Creada Exitosamente';
        this.showToast = true;
        this.redirectTo();

      },
      error: (err) => {

        if (err.error[0].message == 'The account code already exists.') {
          this.toastType = typeToast.Warning;
          const codeArray = code.split("-");
          this.accountForm.code = codeArray[0] == "" ? this.accountForm.code : codeArray.at(-1);
          this.messageToast = 'El codigo de la cuenta ya existe.';
          this.showToast = true;
          return
        } else {
          this.toastType = typeToast.Error;
          this.messageToast = 'No se pudo crear la cuenta';
          this.showToast = true;
          this.redirectTo();
        }


      }
    });
  }

  private updateAccount(): void {

    let code: string = "";
    if (this.accountForm.parentId) {
      code = this.accountPrefix + '-' + this.accountForm.code;
      this.accountForm.code = code;
    }
    this.accountForm.status = this.accountForm.isActive ? "ACTIVO" : "INACTIVO";
    this.accountService
      .updateAccount(Number(this.id), this.accountForm)
      .subscribe({
        next: () => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Cambios realizados exitosamente.';
          this.showToast = true;

          this.redirectTo();
        },
        error: (err) => {

          if (err == 'Account with code 1-102 already exists.') {
            this.toastType = typeToast.Warning;
            const codeArray = code.split("-");
            this.accountForm.code = codeArray[0] == "" ? this.accountForm.code : codeArray.at(-1);
            this.messageToast = 'El codigo de la cuenta ya existe.';
            this.showToast = true;

          } else {

            this.toastType = typeToast.Error;
            this.messageToast = 'No se pudo crear la cuenta';
            this.showToast = true;
            this.redirectTo();
          }
        }

      });
  }

  private fillForm(data: AccountAPIResponse): void {
    this.accountForm.id = data.id;
    this.accountForm.category = data.categoryId;
    if (this.id) {
      const codeArray = data.accountCode.split("-");
      this.accountForm.code = codeArray.at(-1);
    } else {
      this.accountForm.code = data.accountCode;
    }
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

    if (data.balances.length == 0) {
      const balances = [{ typicalBalance: "", initialBalance: 0, isCurrent: true }
      ];
      this.accountForm.balances = balances;
    } else {
      this.accountForm.balances = data.balances;
    }

    this.accountForm.accountType = data.accountType;
    this.accountFatherIsRequired = data.supportEntry;
    this.accountForm.asTransaction = data.asTransaction;

    this.hasTransaction = data.asTransaction;
    this.hasChildAccounts = data.hasChildAccounts;

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

  redirectTo() {
    setTimeout(() => {
      this.router.navigate(['accounting/configuration']);
    }, 2000);
  }


}
