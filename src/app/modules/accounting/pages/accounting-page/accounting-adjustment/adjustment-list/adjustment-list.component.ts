import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, Subscription, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import themes from 'devextreme/ui/themes';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';

type RowAdjust = {
  id: number;
  transactionId: number;
  invoiceNo: string;
  reference: string;
  creationDate: Date;
  rawStatus: string;
  statusLabel: string;
  isDraft: boolean;
};

@Component({
  selector: 'app-adjustment-list',
  templateUrl: './adjustment-list.component.html',
  styleUrl: './adjustment-list.component.css'
})
export class AdjustmentListComponent {
  private subscription: Subscription = new Subscription();
  error: Error | null = null;

  private readonly router = inject(Router);
  private readonly adjustemntService = inject(AdjusmentService);
  private readonly navigate = inject(NavigationService);
  private readonly userService = inject(UsersService);

  dataSource$!: Observable<RowAdjust[]>;

  messageToast = '';
  showToast = false;
  toastType: ToastType = typeToast.Info;

  allMode: 'allPages' | 'page';
  checkBoxesMode: 'always' | 'onClick' | 'none';
  selectOptions = [
    { id: 'allPages', name: 'Todos' },
    { id: 'page', name: 'Página' },
  ];

  selectRows: number[] = [];

  isRegistreAccounting = false;
  isApprove = false;

  constructor() {
    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }

  ngOnInit(): void {
    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company) => {
        this.validPermisition(company);
      })
    );

    this.loadData();
  }

  private loadData() {
    this.dataSource$ = this.adjustemntService.getAll().pipe(
      map((data) => this.fillDataSource(data)),
      tap({ error: (err) => (this.error = err) }),
      catchError(() => of([]))
    );
  }

  private fillDataSource(data: AdjustmentResponse[]): RowAdjust[] {
    return data.map((item) => {
      const rawStatus = (item.status || '').toUpperCase();
      const isDraft = rawStatus === 'DRAFT';

      return {
        id: item.id,
        transactionId: item.transactionId,
        invoiceNo: item.invoiceNo,
        reference: item.reference,
        creationDate: new Date(item.creationDate),
        rawStatus,
        statusLabel: isDraft ? 'Borrador' : 'Confirmado',
        isDraft,
        descriptionAdjustment: item.descriptionAdjustment
      };
    });
  }

  goToAdjustment = () => {
    this.router.navigate(['accounting/new/adjustment']);
  };

  onButtonClick(row: RowAdjust) {
    const mode = row.isDraft ? 'edit' : 'view';
    this.router.navigate(
      ['/accounting/adjustment', row.id],
      { queryParams: { mode } }
    );
  }


  onRowSelected(event: any): void {
    const rows: RowAdjust[] = event.selectedRowsData || [];
    this.selectRows = rows.filter(r => r.isDraft).map(r => r.id);
  }

  posting() {
    confirm('¿Está seguro de que desea realizar esta acción?', 'Advertencia')
      .then((ok) => {
        if (!ok || this.selectRows.length === 0) return;

        this.adjustemntService.putAllAdjustment(this.selectRows).subscribe({
          next: () => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Ajustes confirmados con éxito';
            this.showToast = true;

            this.loadData();
            this.selectRows = [];
          },
          error: () => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar confirmar ajustes';
            this.showToast = true;
          },
        });
      });
  }

  async validPermisition(company: any) {
    if (!company) return;

    this.isRegistreAccounting = false;
    this.isApprove = false;

    for (const role of company.roles || []) {
      if (role.name === 'REGISTRO CONTABLE') this.isRegistreAccounting = true;
      if (role.name === 'APROBADOR') this.isApprove = true;
    }
  }
}
