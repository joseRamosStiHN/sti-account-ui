import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {  map, Observable } from 'rxjs';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { AccountAPIResponse } from 'src/app/modules/accounting/models/APIModels';
import { AccountService } from 'src/app/modules/accounting/services/account.service';

@Component({
  selector: 'app-balance-list',
  templateUrl: './balance-list.component.html',
  styleUrl: './balance-list.component.css'
})
export class BalanceListComponent {
  accountList$: Observable<AccountAPIResponse[]> | undefined;

  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  constructor() {}

  ngOnInit(): void {
    this.accountList$ = this.accountService.getAllAccount().pipe(
      map(accounts =>
        accounts.filter(account => account.supportEntry ==true)
      )
    );
  }

  onEditAccount(e: AccountModel) {
    this.router.navigate(['/accounting/configuration/balance/accounts/inital', e.id]);
  }

}
