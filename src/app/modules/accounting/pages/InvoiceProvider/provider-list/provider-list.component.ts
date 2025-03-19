import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListProvider, DocumentType, typeToast } from '../../../models/models';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionResponse } from '../../../models/APIModels';
import { ToastType } from 'devextreme/ui/toast';
import { catchError, firstValueFrom, map, Observable, of, Subscription, tap } from 'rxjs';
import themes from 'devextreme/ui/themes';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';

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

  private subscription: Subscription = new Subscription();

  dataSource$: Observable<BillingListProvider[]> | undefined;

  currentValue!: (string | number | Date)[];


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



  private readonly router = inject(Router);
  private readonly service = inject(TransactionService);
    private readonly navigate = inject(NavigationService);

  constructor() {

    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }

  ngOnInit(): void {
    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company)=>{
        this.validPermisition(company);
      })
    )
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
      .getTransactionByDate(dateInit, dateEnd)
      .pipe(
        map((data) => {
          return data.filter(item => item.documentType === 2)
        }),
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
        creationDate: new Date(item.creationDate),
        status:
          item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Publicado',
        description: item.description,
        numberPda: item.numberPda
      } as BillingListProvider;
    });
  }

  currentValueChanged(event: any): void {
    const date: [Date, Date] = event.value;
    this.currentValue = date;
  };

  onRowSelected(event: any): void {
    this.selectRows = event.selectedRowsData.filter((data: BillingListProvider) => data.status == "Borrador")
      .map((data: BillingListProvider) => data.id);

  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      if (d) {
        this.service.putAllTransaction(this.selectRows).subscribe({
          next: (data) => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Transacciónes confirmadas con exito';
            this.showToast = true;
  
            setTimeout(() => {
              this.ngOnInit();
            }, 3000);
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar confirmar Transacciónes';
            this.showToast = true;
          },
        });
      }
    }
    );
  }


  async validPermisition(company:any) {
  
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
