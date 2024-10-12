import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

@Component({
  selector: 'app-credit-note-list',
  templateUrl: './credit-note-list.component.html',
  styleUrl: './credit-note-list.component.css'
})
export class CreditNoteListComponent {

  error: Error | null = null;
  private readonly router = inject(Router);
  dataSource$: Observable<AdjustmentResponse[]> | undefined;

  private readonly transactionService = inject(TransactionService);


  ngOnInit(): void {
    this.dataSource$ = this.transactionService.getAllNotasCredits()
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
    this.router.navigate(['accounting/credit-notes']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/credit-notes', data.id]);
  }

}
