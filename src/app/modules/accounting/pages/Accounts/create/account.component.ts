import { Component, inject, OnInit } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/AccountModel';
import {
  AccountAPIResponse,
  AccountCategories,
} from '../../../models/APIModels';

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
    status: 'ACTIVO',
    balances: [],
  };
  accounts!: Account[];
  categories!: AccountCategories[];

  accountFatherIsRequired:boolean=false;

  private readonly activeRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  constructor() {}

  ngOnInit(): void {
    this.accountService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Error al obtener datos', err),
    });

    this.accountService.getAllAccount().subscribe({
      next: (data) =>{
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

  onValueChange(e: Event): void {
    const target = e.target as HTMLSelectElement;

    if (target) {
      const id = Number(target.value);
      const data = this.accounts.find((f) => f.id === id);
      this.accountPrefix = data?.code ?? '';
    }
  }

  private createAccount(): void {
    this.accountService.createAccount(this.accountForm).subscribe(() => {
      this.router.navigate(['accounting/configuration']);
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

  onValueStatus(event:any){
    this.accountFatherIsRequired = event.target.value;
  }
}
