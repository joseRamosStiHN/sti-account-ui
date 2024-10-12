import { Component, inject } from '@angular/core';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';


@Component({
  selector: 'app-debit-note-list',
  templateUrl: './debit-note-list.component.html',
  styleUrl: './debit-note-list.component.css'
})
export class DebitNoteListComponent {


  error: Error | null = null;
  private readonly router = inject(Router);
  dataSource$: Observable<AdjustmentResponse[]> | undefined;

  private readonly transactionService = inject(TransactionService);


  ngOnInit(): void {
    this.dataSource$ = this.transactionService.getAllNotasDebits()
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


  private fillDataSource(data: any): any[] {


    return data.map((item:any) => {
      return {
        id: item.id,
        transactionId: item.transactionId,
        invoiceNo:item.invoiceNo,
        reference: item.reference,
        description:item.descriptionNote,
        status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
        creationDate: item.creationDate,

      } as any;
    });


  }

  goToAdjustment = () => {
    this.router.navigate(['accounting/debit-notes']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/debit-notes', data.id]);
  }

}
