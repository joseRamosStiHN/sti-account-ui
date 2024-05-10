import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AccountModel } from '../../models/AccountModel';
import { AccountAPIResponse } from '../../models/APIModels';
import { RowPreparedEvent } from 'devextreme/ui/data_grid';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent implements OnInit {
  accountList: AccountAPIResponse[] = [];
  loadingData: boolean = true;
  /*injections */
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  constructor() {}

  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data;
        this.loadingData = false;
      },
      error: (err) => {
        this.loadingData = false;
        console.log('we got and error', err);
      },
    });
  }

  onEditAccount(e: AccountModel) {
    this.router.navigate(['/accounting/configuration/update-account', e.id]);
  }

  goToNewAccount = () => {
    this.router.navigate(['/accounting/configuration/new-account']);
  };
}
