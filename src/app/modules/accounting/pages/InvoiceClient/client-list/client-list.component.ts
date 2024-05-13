import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListClient, DocumentType } from '../../../models/models';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionResponse } from '../../../models/APIModels';
import { map, Observable } from 'rxjs';

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
  dataSource$: Observable<BillingListClient[]> | undefined;

  currentValue: [Date, Date] = initialValue;
  private readonly router = inject(Router);
  private readonly transService = inject(TransactionService);
  constructor() {}
  ngOnInit(): void {
    this.dataSource$ = this.transService
      .getAllTransactionByDocumentType(DocumentType.INVOICE_CLIENT)
      .pipe(map((data) => this.fillDataSource(data)));
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

  private fillDataSource(data: TransactionResponse[]): BillingListClient[] {
    return data.map((item) => {
      return {
        id: item.id,
        document: item.reference,
        dateAt: item.date,
        status:
          item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
        description: item.description,
      } as BillingListClient;
    });
  }
}
