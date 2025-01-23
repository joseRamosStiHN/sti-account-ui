import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { AdjustmentResponse } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import themes from 'devextreme/ui/themes';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';

@Component({
  selector: 'app-adjustment-list',
  templateUrl: './adjustment-list.component.html',
  styleUrl: './adjustment-list.component.css'
})
export class AdjustmentListComponent {

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

  constructor() { 

    this.allMode = 'allPages';
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
  }


  ngOnInit(): void {
    this.validPermisition();
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
    );
  }

  async validPermisition() {

    const savedUser = localStorage.getItem('userData');
    const company = JSON.parse(localStorage.getItem('company') || '');

    if (!savedUser || company == '') {
      console.error('Datos de usuario o compañía no encontrados.');
      return;
    }

    const usuario = JSON.parse(savedUser);
    this.user =  await firstValueFrom(this.userService.getUSerById(usuario.id));

    const companyRole = this.user.companies.find((com: any) => com.company.id === company.company.id);

    if (!companyRole) {
      console.error('No se encontró un rol para la compañía especificada.');
      console.log('company.id:', company.id);
      console.log('this.user.companies:', this.user.companies);
      return;
    }

   await companyRole.roles.forEach((role: any) => { 

      console.log(role);
      

      if (role.name == 'REGISTRO CONTABLE') {       
        this.isRegistreAccounting = true;
      }

      if (role.name == 'APROBADOR') {
        this.isApprove = true;
      }
      
    })


  }
}
