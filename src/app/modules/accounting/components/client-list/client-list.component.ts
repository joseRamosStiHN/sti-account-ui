import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListClient } from '../../models/models';
import { TransactionService } from '../../services/transaction.service';
import { BillingClientResponse } from '../../models/APIModels';

const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const initialValue: [Date, Date] = [
  new Date(now.getTime() - msInDay * 30),
  new Date(now.getTime()),
];
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  dataSource: BillingListClient[] = [];

  currentValue: [Date, Date] = initialValue;
  private readonly router = inject(Router);
  private readonly transService = inject(TransactionService);
  constructor() {}
  ngOnInit(): void {
    //TODO: aqui hacer el llamadas inicial del API para mostras los primeros 30 dias
    this.transService.getAllClientBilling().subscribe({
      next: (data) => this.fillDataSource(data),
      error: (err) => console.error('error while made a request, ', err),
    });
  }

  onSearch(): void {
    const [dateIni, dateEnd] = this.currentValue;
    //TODO: aqui Laurent
    /*
      se debe hacer un llamadas al un api que retiren los registros en las fechas especificadas
    */
  }

  goToClient = () => {
    this.router.navigate(['/accounting/client-invoicing']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/client-invoicing', data.id]);
  }

  private fillDataSource(data: BillingClientResponse[]): void {
    this.dataSource = data.map((item) => {
      return {
        id: item.id,
        document: item.reference,
        dateAt: item.date,
        status: item.status,
        description: item.description,
      } as BillingListClient;
    });
  }
}
