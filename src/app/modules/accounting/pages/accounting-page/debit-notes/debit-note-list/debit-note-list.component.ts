import { Component, inject } from '@angular/core';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of, Subscription, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';
import themes from 'devextreme/ui/themes';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';

@Component({
  selector: 'app-debit-note-list',
  templateUrl: './debit-note-list.component.html',
  styleUrl: './debit-note-list.component.css'
})
export class DebitNoteListComponent {

  private subscription: Subscription = new Subscription();
  error: Error | null = null;
  private readonly router = inject(Router);
  dataSource$: Observable<AdjustmentResponse[]> | undefined;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  // seleccion por paginacion
  allMode: string;
  checkBoxesMode: string;
  selectOptions: { id: string, name: string }[] = [
    { id: 'allPages', name: 'Todos' },
    { id: 'page', name: 'Página' }
  ];

  selectRows: number[] = [];


  user?: UsersResponse;
  private readonly userService = inject(UsersService);

  isRegistreAccounting: boolean = false;
  isApprove: boolean = false;

  private readonly transactionService = inject(TransactionService);
  private readonly navigate = inject(NavigationService);


  constructor() {

    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }



  ngOnInit(): void {

    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company) => {
        this.validPermisition(company);
      })
    )

    this.loadData();

  }

  private loadData() {
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
    return data.map((item: any) => {
      const rawStatus = (item.status || '').toUpperCase();
      const isDraft = rawStatus === 'DRAFT';

      return {
        id: item.id,
        transactionId: item.transactionId,
        invoiceNo: item.invoiceNo,
        reference: item.reference,
        description: item.descriptionNote,
        creationDate: new Date(item.creationDate),
        rawStatus,
        statusLabel: isDraft ? 'Borrador' : 'Confirmado',
        isDraft
      };
    });
  }


  goToAdjustment = () => {
    this.router.navigate(['accounting/debit-notes']);
  };

  onButtonClick(row: any) {
    const mode = row.isDraft ? 'edit' : 'view';
    this.router.navigate(['/accounting/debit-notes', row.id], {
      queryParams: { mode },
    });
  }


  onRowSelected(event: any): void {
    const rows = event.selectedRowsData || [];
    this.selectRows = rows.filter((r: any) => r.isDraft).map((r: any) => r.id);
  }


  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      if (d) {
        this.transactionService.putAllDebitNotes(this.selectRows).subscribe({
          next: (data) => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Notas de Débito confirmadas con exito';
            this.showToast = true;

            this.loadData();
            this.selectRows = [];
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar confirmar Notas de Débito';
            this.showToast = true;
          },
        });
      }

    }
    );
  }

  async validPermisition(company: any) {

    if (company == '') {
      console.error('Datos de usuario o compañía no encontrados.');
      return;
    }


    await company.roles.forEach((role: any) => {

      if (role.name == 'REGISTRO CONTABLE') {
        this.isRegistreAccounting = true;
      }

      if (role.name == 'APROBADOR') {
        this.isApprove = true;
      }

    })

  }


}
