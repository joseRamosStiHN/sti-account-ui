import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListProvider } from '../models/models';

const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const initialValue: [Date, Date] = [
  new Date(now.getTime() - msInDay * 30),
  new Date(now.getTime()),
];
@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.css',
})
export class ProviderListComponent {
  dataSource: BillingListProvider[] = [
    {
      id: 1,
      amount: 122.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura 0001',
      entryNumber: '1',
      status: 'Borrador',
    },
    {
      id: 2,
      amount: 100.0,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura 0002',
      entryNumber: '87',
      status: 'Posted',
    },
    {
      id: 3,
      amount: 60.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '3',
      status: 'Borrador',
    },
    {
      id: 4,
      amount: 120.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '12',
      status: 'Borrador',
    },
    {
      id: 5,
      amount: 50000.001,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '23',
      status: 'Borrador',
    },
    {
      id: 6,
      amount: 20000.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '2',
      status: 'Borrador',
    },
    {
      id: 7,
      amount: 17622.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '5',
      status: 'Borrador',
    },
    {
      id: 8,
      amount: 23332121.35,
      account: 'Cuentas por pagar',
      dateAt: new Date(),
      document: 'Factura',
      entryNumber: '6',
      status: 'Borrador',
    },
  ];

  currentValue: [Date, Date] = initialValue;
  private readonly router = inject(Router);

  constructor() {}
  ngOnInit(): void {
    //TODO: aqui hacer el llamadas inicial del API para mostras los primeros 30 dias
  }

  onSearch(): void {
    const [dateIni, dateEnd] = this.currentValue;
    //TODO: aqui Laurent
    /*
      se debe hacer un llamadas al un api que retiren los registros en las fechas especificadas
    */
  }

  goToClient = () => {
    this.router.navigate(['/accounting/provider-invoicing']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/provider-invoicing', data.id]);
  }
}
