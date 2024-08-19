import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListClient, DocumentType } from '../../../models/models';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionResponse } from '../../../models/APIModels';
import { catchError, filter, map, Observable, of, tap } from 'rxjs';

const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const pastNow = new Date();
const initialValue: [Date, Date] = [
  new Date(pastNow.getTime() - msInDay * 30),
  new Date(now.getTime()),
];
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  dataSource$: Observable<BillingListClient[]> | undefined;
  error: Error | null = null;
  roles: string[] = ['admin', 'teller'];

  currentValue!: (string | number | Date)[];

  private readonly router = inject(Router);
  private readonly transService = inject(TransactionService);
  constructor() { }
  ngOnInit(): void {
    this.currentValue = initialValue.map(date =>
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    );

    this.dataSource$ = this.transService
      .getAllTransactionByDocumentType(DocumentType.INVOICE_CLIENT)
      .pipe(
        map((data) => this.fillDataSource(data)),
        tap({
          error: (err) => {
            this.error = err;
          },
        }),
        catchError((err) => {
          console.log('handler error in component');
          return of([]);
        })
      );
  }

  
 

  onSearch(): void {
    const [dateIniStr, dateEndStr] = this.currentValue;
    const [yearIni, monthIni, dayIni] = dateIniStr.toString().split('-').map(num => parseInt(num, 10));
    const [yearEnd, monthEnd, dayEnd] = dateEndStr.toString().split('-').map(num => parseInt(num, 10));
    const dateIni = new Date(yearIni, monthIni - 1, dayIni);
    const dateEnd = new Date(yearEnd, monthEnd - 1, dayEnd);

    if (dateEnd < dateIni) {
      return;
    }

   this.dataSource$ = this.dataSource$?.pipe(
      map(data => {
        return data.filter(invoice => {
          const invoiceDate = new Date(invoice.dateAt); 
          return invoiceDate >= dateIni && invoiceDate <= dateEnd;
        });
      })
    )
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

  currentValueChanged(event: any): void {
    const date: [string,string] = event.value;
    this.currentValue = date.map(date=> date.toString().replaceAll("/","-"));
  };

}
