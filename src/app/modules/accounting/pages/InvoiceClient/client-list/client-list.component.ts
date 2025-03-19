import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillingListClient, DocumentType, typeToast } from '../../../models/models';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionResponse } from '../../../models/APIModels';
import { catchError, filter, firstValueFrom, map, Observable, of, Subscription, tap } from 'rxjs';
import themes from 'devextreme/ui/themes';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { NavigationService } from 'src/app/shared/navigation.service';
import { UsersService } from 'src/app/modules/users/users.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';

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

  private subscription: Subscription = new Subscription();

  dataSource$: Observable<BillingListClient[]> | undefined;
  error: Error | null = null;
  roles: string[] = ['admin', 'teller'];

  currentValue!: (string | number | Date)[];


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  user?: UsersResponse;
  private readonly userService = inject(UsersService);

  isRegistreAccounting:boolean = false;
  isApprove:boolean= false;

  // seleccion por paginacion
  allMode: string;
  checkBoxesMode: string;
  selectOptions: { id: string, name: string }[] = [
    { id: 'allPages', name: 'Todos' },
    { id: 'page', name: 'Página' }
  ];

  selectRows: number[] = [];

  private readonly router = inject(Router);
  private readonly transService = inject(TransactionService);
  private readonly navigate = inject(NavigationService);


  constructor() {

    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }

  ngOnInit(): void {
    this.currentValue = initialValue;

    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company)=>{
        this.validPermisition(company);
      })
    )

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
    let [dateInit, dateEnd] = this.currentValue;


    if (dateEnd < dateInit) {
      return;
    }

    dateInit = new Date(dateInit);
    dateEnd = new Date(dateEnd);

    this.dataSource$ = this.transService
      .getTransactionByDate(dateInit, dateEnd)
      .pipe(
        map((data) => {
          return data.filter(item => item.documentType === 1)
        }),
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
        creationDate: new Date(item.creationDate),
        status:
          item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
        description: item.description,
        numberPda: item.numberPda
      } as BillingListClient;
    });
  }

  currentValueChanged(event: any): void {
    const date: [Date, Date] = event.value;
    this.currentValue = date;
  };



  onRowSelected(event: any): void {

    this.selectRows = event.selectedRowsData.filter((data: BillingListClient) => data.status == "Borrador")
      .map((data: BillingListClient) => data.id);
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      if (d) {
        this.transService.putAllTransaction(this.selectRows).subscribe({
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
