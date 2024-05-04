import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountService } from '../../services/account.service';
import { AccountModel } from '../models/AccountModel';


@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent implements OnInit {

  accountList: AccountModel[] = [];

  /*injections */
  private readonly router = inject(Router);
  private accountService = inject(AccountService);
  constructor() {}

  ngOnInit(): void {
    //TODO: Laurent
    /*
      aqui debe hacer la integración cambie el metodo fakeData por el servicio
      
    */
    this.accountService.getAllAccount().subscribe((response: any[]) => {
      if (Array.isArray(response)) {
        this.accountList = response;
      } else {
        console.error('Error al obtener datos de cuentas');
      }
    });
  }

  onEditAccount(e: AccountModel) {
    this.router.navigate(['/accounting/configuration/update-account', e.id]);
  }

  goToNewAccount = () => {
    this.router.navigate(['/accounting/configuration/new-account']);
  };

  //private fakeData(): AccountList[] {
  //const copyData = [...myDataFake];
  //return copyData;
  //}
}
