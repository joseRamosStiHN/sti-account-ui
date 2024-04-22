import { Component, inject, OnInit } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface FormAccount {
  id?: number;
  description?: string;
  code?: string;
  parentId?: number;
  categoryId?: number;
  topicallyAmount?: string;
  hasEntry?: boolean;
  isActive: boolean;
}
interface Account {
  id: number;
  code: string;
  name: string;
}
interface KeyValue {
  id: number;
  name: string;
}
const listOfCategory: KeyValue[] = [
  {
    id: 1,
    name: 'Categoría 1',
  },
  {
    id: 2,
    name: 'Categoría 2',
  },
  {
    id: 3,
    name: 'Categoría 3',
  },
];

const listAccounts: Account[] = [
  {
    code: '01',
    id: 1,
    name: 'Activo',
  },
  {
    code: '02',
    id: 2,
    name: 'Pasivo',
  },
];

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  accountPrefix: string = '';
  id: string | null = null;
  accountForm: FormAccount = {
    description: '',
    code: '',
    isActive: true,
  };
  accounts!: Account[];
  categories!: KeyValue[];

  private readonly activeRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  constructor() {}

  ngOnInit(): void {
    //this.id = 1;
    //TODO: Laurent
    /*
      Aqui debe integrar y agregar la logica de cuando es editar o cuando es nuevo
      cuando es editar llene el objeto accountForm
    */

    this.accounts = this.fakeAccountsList();
    this.categories = this.fakeDataCategory();
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.accountForm.isActive = false;
      //aqui puede ver si hay datos y llenar el objeto del formulario
    });
  }

  onSubmit(e: NgForm) {
    if (e.valid) {
      //TODO: Laurent
      /*
        Aqui es donde debe hacer la integracion 
        cuando es nuevo el id no va existir 
      */
      //como se cuando hat un id, lo sabemos cuando recuperamos desde la url,
      //en onInit asignamos el valor
      if (!this.id) {
        //flujo de nuevo
        //salir
        this.router.navigate(['accounting/configuration']);
        return;
      }

      //flujo de Editar
    }
  }

  onValueChange(e: Event): void {
    const target = e.target as HTMLSelectElement;

    if (target) {
      const id = Number(target.value);
      const data = listAccounts.find((f) => f.id === id);
      this.accountPrefix = data?.code ?? '';
    }
  }

  /*FAKE DATA */
  private fakeAccountsList(): Account[] {
    return listAccounts;
  }

  private fakeDataCategory(): KeyValue[] {
    return listOfCategory;
  }
}
