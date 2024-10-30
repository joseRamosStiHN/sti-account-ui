import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListProvider, DocumentType } from '../../../models/models';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionResponse } from '../../../models/APIModels';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { catchError, map, Observable, of, tap } from 'rxjs';

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
  dataSource$: Observable<BillingListProvider[]> | undefined;

  currentValue!: (string | number | Date)[];
  private readonly router = inject(Router);
  private readonly service = inject(TransactionService);

  constructor() {}
  ngOnInit(): void {
    this.currentValue = initialValue;
    this.dataSource$ = this.service
      .getAllTransactionByDocumentType(DocumentType.INVOICE_PROVIDER)
      .pipe(map((trans) => this.fillDataSource(trans)));
  }

  onSearch(): void {

    let [dateInit, dateEnd] = this.currentValue;

  
    if (dateEnd < dateInit) {  
      return;
    }

    dateInit = new Date(dateInit);
    dateEnd = new Date(dateEnd);

    this.dataSource$ = this.service
    .getTransactionByDate(dateInit,dateEnd)
    .pipe(
      map((data) => {      
        return data.filter(item => item.documentType === 2)}),
      map((data) => this.fillDataSource(data)),
      tap({
        error: (err) => {
          console.log(err);
          
        },
      }),
      catchError((err) => {
        console.log('handler error in component');
        return of([]);
      })
    );
  }

  goToClient = () => {
    this.router.navigate(['/accounting/provider-invoicing']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/provider-invoicing', data.id]);
  }

  private fillDataSource(data: TransactionResponse[]): BillingListProvider[] {
    return data.map((item) => {
      return {
        id: item.id,
        document: item.reference,
        dateAt: item.date,
        status:
          item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Publicado',
        description: item.description,
        numberPda:item.numberPda
      } as BillingListProvider;
    });
  }

  currentValueChanged(event: any): void {
    const date: [Date,Date] = event.value;
    this.currentValue = date;
  };
}
