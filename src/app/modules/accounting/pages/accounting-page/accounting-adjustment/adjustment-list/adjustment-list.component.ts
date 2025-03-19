import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of, Subscription, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import themes from 'devextreme/ui/themes';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';

@Component({
  selector: 'app-adjustment-list',
  templateUrl: './adjustment-list.component.html',
  styleUrl: './adjustment-list.component.css'
})
export class AdjustmentListComponent {
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

  selectRows:number[]=[];


   
  user?: UsersResponse;
  private readonly userService = inject(UsersService);
 
   isRegistreAccounting:boolean = false;
  isApprove:boolean= false;

  private readonly adjustemntService = inject(AdjusmentService);
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
    this.dataSource$ = this.adjustemntService.getAll()
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


  private fillDataSource(data: AdjustmentResponse[]): AdjustmentResponse[] {


    return data.map((item) => {
      return {
        id: item.id,
        transactionId: item.transactionId,
        invoiceNo:item.invoiceNo,
        reference: item.reference,
        status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
        creationDate: item.creationDate,

      } as AdjustmentResponse;
    });


  }

  goToAdjustment = () => {
    this.router.navigate(['accounting/new/adjustment']);
  };

  onButtonClick(data: any) {
    this.router.navigate(['/accounting/adjustment', data.id]);
  }


  onRowSelected(event: any): void {

    this.selectRows =  event.selectedRowsData.filter( (data:AdjustmentResponse)=> data.status =="Borrador")
                    .map((data:AdjustmentResponse)=> data.id);                  
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      if (d) {
        this.adjustemntService.putAllAdjustment(this.selectRows).subscribe({
          next: (data) => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Ajustes confirmados con exito';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/accounting']); 
            }, 3000);
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar confirmar Ajustes';
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
