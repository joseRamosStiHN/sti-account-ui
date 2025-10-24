import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { catchError, map, Observable, of, Subscription, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import themes from 'devextreme/ui/themes';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';

@Component({
  selector: 'app-credit-note-list',
  templateUrl: './credit-note-list.component.html',
  styleUrl: './credit-note-list.component.css'
})
export class CreditNoteListComponent {

  private subscription: Subscription = new Subscription();
  error: Error | null = null;

  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly userService = inject(UsersService);
  private readonly navigate = inject(NavigationService);

  dataSource$: Observable<AdjustmentResponse[]> | undefined;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  // selección masiva
  allMode: string;
  checkBoxesMode: string;
  selectOptions: { id: string, name: string }[] = [
    { id: 'allPages', name: 'Todos' },
    { id: 'page', name: 'Página' }
  ];

  // IDs seleccionados que SÍ son borrador
  selectRows: number[] = [];

  user?: UsersResponse;

  isRegistreAccounting: boolean = false;
  isApprove: boolean = false;

  constructor() {
    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }

  ngOnInit(): void {
    // escuchar empresa/roles para permisos
    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company) => {
        this.validPermisition(company);
      })
    );

    this.loadData();
  }

  private loadData() {
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

  /**
   * - rawStatus: el status real (DRAFT / SUCCESS / etc.)
   * - isDraft: boolean para saber si se puede editar/confirmar
   * - statusLabel: 'Borrador' o 'Confirmado'
   * - creationDate: pasamos a Date para que el grid lo formatee como fecha
   */
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

  // navegar para crear nueva nota de crédito
  goToAdjustment = () => {
    this.router.navigate(['accounting/credit-notes']);
  };

  /**
   * Igual que en DebitNoteList:
   * si es borrador -> modo edición
   * si está confirmada -> modo vista
   */
  onButtonClick(row: any) {
    const mode = row.isDraft ? 'edit' : 'view';
    this.router.navigate(['/accounting/credit-notes', row.id], {
      queryParams: { mode },
    });
  }

  /**
   * Cuando el usuario selecciona filas en el grid:
   * guardamos SOLO las que están en borrador (isDraft === true)
   * y nos quedamos solo con los IDs
   */
  onRowSelected(event: any): void {
    const rows = event.selectedRowsData || [];
    this.selectRows = rows
      .filter((r: any) => r.isDraft)
      .map((r: any) => r.id);
  }

  /**
   * Confirmar todas las notas seleccionadas:
   * - pide confirmación al usuario
   * - llama putAllCreditNotes(selectRows)
   * - muestra toast
   * - recarga data y limpia selección
   */
  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        this.transactionService.putAllCreditNotes(this.selectRows).subscribe({
          next: () => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Notas de Crédito confirmadas con éxito';
            this.showToast = true;

            // recargamos data para que el grid ya muestre "Confirmado"
            this.loadData();
            this.selectRows = [];
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar confirmar Notas de Crédito';
            this.showToast = true;
          },
        });
      }
    });
  }

  /**
   * Roles de la empresa seleccionada determinan:
   * - puede crear (REGISTRO CONTABLE)
   * - puede confirmar (APROBADOR)
   */
  async validPermisition(company: any) {
    if (company == '') {
      console.error('Datos de usuario o compañía no encontrados.');
      return;
    }

    company.roles.forEach((role: any) => {
      if (role.name == 'REGISTRO CONTABLE') {
        this.isRegistreAccounting = true;
      }

      if (role.name == 'APROBADOR') {
        this.isApprove = true;
      }
    });
  }
}
