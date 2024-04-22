import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';

interface AccountList {
  id: number;
  codeAccount: string;
  description: string;
  categoryName: string;
  categoryId: number;
  accountParentName?: string | null;
  accountParentId?: number | null;
  status: string;
}

const myDataFake: AccountList[] = [
  {
    id: 1,
    codeAccount: '01',
    description: 'test',
    categoryName: 'category',
    categoryId: 1,
    accountParentName: null,
    accountParentId: null,
    status: 'Activa',
  },
  {
    id: 2,
    codeAccount: '01-002',
    description: 'cuenta 2',
    categoryName: 'category 1',
    categoryId: 1,
    accountParentName: 'test',
    accountParentId: 1,
    status: 'Activa',
  },

  {
    id: 3,
    codeAccount: '02',
    description: 'test 2',
    categoryName: 'category',
    categoryId: 1,
    accountParentName: null,
    accountParentId: null,
    status: 'Activa',
  },
];

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent implements OnInit {
  dataSource: AccountList[] = [];

  /*injections */
  private readonly router = inject(Router);
  constructor() {}

  ngOnInit(): void {
    //TODO: Laurent
    /*
      aqui debe hacer la integración cambie el metodo fakeData por el servicio
      
    */
    this.dataSource = this.fakeData();
  }

  onEditAccount(e: AccountList) {
    this.router.navigate(['/accounting/configuration/update-account', e.id]);
  }
  goToNewAccount = () => {
    this.router.navigate(['/accounting/configuration/new-account']);
  };

  private fakeData(): AccountList[] {
    const copyData = [...myDataFake];
    return copyData;
  }
}
