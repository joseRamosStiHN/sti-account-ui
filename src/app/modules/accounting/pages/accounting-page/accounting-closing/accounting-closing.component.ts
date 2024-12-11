import { Component, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PeriodClosing } from 'src/app/modules/accounting/models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { ClosingPeriodsAll, NextPeridModel, typeToast } from 'src/app/modules/accounting/models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounting-closing',
  templateUrl: './accounting-closing.component.html',
  styleUrl: './accounting-closing.component.css'
})
export class AccountingClosingComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  isPopupVisible = false;

  closureTypeOptions = [
    { value: 'ANNUAL', text: 'Anual' },
    { value: 'MONTHLY', text: 'Mensual' },
    { value: 'WEEKLY', text: 'Semanal' }
  ];

  

  private readonly periodService = inject(PeriodService);
  private readonly router = inject(Router);
  infoClosing?:PeriodClosing;
  periodsClosing:ClosingPeriodsAll[]=[];
  nextPeriod:NextPeridModel = {
    closureType: "",
    startPeriod: "",
    endPeriod: "",
    daysPeriod: 0
  };

  constructor(){
    this.periodService.getInfoClosingPeriod().subscribe({
      next: (info) => {
        this.infoClosing = info;
      },
      error: (err) => {
        console.error('Error al obtener la información del periodo de cierre', err);

        this.toastType = typeToast.Error;
        this.messageToast = 'Error al consultar datos del periodo actual';
        this.showToast = true;

        setTimeout(() => {
          this.router.navigate(['/accounting/configuration/period']);
        }, 3000);
      }
    });
    
    this.periodService.getAllClosing().subscribe({
      next: (info) => {
        this.periodsClosing = info;
      },
      error: (err) => {
        console.error('Error al obtener la información de los periodos cerrados anteriormente', err);

        this.toastType = typeToast.Error;
        this.messageToast = 'Error al consultar datos de periodos cerrados anteriormente';
        this.showToast = true;
      }
    });

    this.periodService.getNextPeriod().subscribe({
      next: (data) => {
        this.nextPeriod = data;
      },
      error: (err) => {
        console.error('Error al obtener la información de el siguiente periodo', err);

        this.toastType = typeToast.Error;
        this.messageToast = 'Error al consultar datos del siguiete periodo Contable';
        this.showToast = true;
      }
    });
    
  }


  closing() {


    this.isPopupVisible = true;

    // let dialogo = confirm(
    //   `¿Está seguro de que desea realizar esta acción?`,
    //   'Advertencia'
    // );

    // dialogo.then(async (d) => {
    
    //     this.periodService.closingPeriod().subscribe({
    //       next: () => {
    //         this.toastType = typeToast.Success;
    //         this.messageToast = 'Periodo Cerrdado Correctamente';
    //         this.showToast = true;

    //         setTimeout(() => {
    //           this.router.navigate(['/accounting/configuration/period']); 
    //         }, 3000);
    //       },
    //       error: (err) => {
    //         console.log(err);
            
    //         this.toastType = typeToast.Error;
    //         this.messageToast = 'Error al intentar cerrar periodo';
    //         this.showToast = true;
    //       },
    //     });
    //   }
    // );
  }


  openPopup(): void {
    this.isPopupVisible = true;
  }

  onPopupHiding(): void {
    this.isPopupVisible = false;
  }


}
