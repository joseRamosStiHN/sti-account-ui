import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface BillingListClient {
  id: number;
  document: string;
  account: string;
  dateAt: Date;
  amount: number;
  status: string;
  entryNumber: string;
}

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent {
  dataSource: BillingListClient[] = [
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

  constructor(private router: Router) {}
  //TODO:
  goToClient = () => {
    this.router.navigate(['/accounting/client-invoicing']);
  };
}
