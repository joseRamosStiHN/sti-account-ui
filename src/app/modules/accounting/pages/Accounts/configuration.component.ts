import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AccountModel } from '../../models/AccountModel';
import { AccountAPIResponse } from '../../models/APIModels';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent implements OnInit {
  accountList$: Observable<AccountAPIResponse[]> | undefined;
  loadingData: boolean = true;
  /*injections */
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  constructor() {}

  ngOnInit(): void {
    this.accountList$ = this.accountService.getAllAccount();
  }

  onEditAccount(e: AccountModel) {
    this.router.navigate(['/accounting/configuration/update-account', e.id]);
  }

  goToNewAccount = () => {
    this.router.navigate(['/accounting/configuration/new-account']);
  };
}
