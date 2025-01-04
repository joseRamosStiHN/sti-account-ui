import { Component, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PeriodClosing } from 'src/app/modules/accounting/models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { ClosingPeriodsAll, NextPeridModel, typeToast } from 'src/app/modules/accounting/models/models';
import { Router } from '@angular/router';
import { log } from 'node:console';

@Component({
  selector: 'app-accounting-closing',
  templateUrl: './accounting-closing.component.html',
  styleUrl: './accounting-closing.component.css'
})
export class AccountingClosingComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  isPopupVisiblePeriod = false;
  isPopupVisibleYear = false;
  titleNextPeriod:string='Proximo Periodo'

  closureTypeOptions = [
    { value: 'ANNUAL', text: 'Anual' },
    { value: 'MONTHLY', text: 'Mensual' },
    { value: 'WEEKLY', text: 'Semanal' }
  ];


  nextYear: boolean = false;
  nextYearPeriod: boolean = false
  nextYearDate!: Date;


  private readonly periodService = inject(PeriodService);
  private readonly router = inject(Router);
  infoClosing?: PeriodClosing;
  periodsClosing: ClosingPeriodsAll[] = [];
  nextPeriod: NextPeridModel = {
    closureType: "",
    startPeriod: "",
    endPeriod: "",
    daysPeriod: 0
  };

  constructor() {
    this.periodService.getInfoClosingPeriod().subscribe({
      next: (info) => {
        this.infoClosing = info;
        const monthDate= new Date(info.endPeriod) ;
        const monthName = monthDate.toLocaleString('es-ES', { month: 'long' });
        this.titleNextPeriod = `Cierre de periodo ${info.typePeriod} ${monthName}`
      },
      error: (err) => {
        console.error('Error al obtener la información del periodo de cierre', err);

        this.toastType = typeToast.Error;
        this.messageToast = 'Error al consultar datos del periodo actual';
        this.showToast = true;

        setTimeout(() => {
          this.router.navigate(['/accounting/accounting-closing']);
        }, 3000);
      }
    });

    this.periodService.getAllClosing().subscribe({
      next: (info) => {
        this.periodsClosing = info;
        this.periodsClosing.map((period) => {
          const fecha = new Date(period.endPeriod);
          console.log(period.accountingPeriodId, fecha.getMonth() + 1);

          if (fecha.getMonth() + 1 == 12 && period.typePeriod.toUpperCase() != "ANUAL") {
            this.nextYear = true;
            this.nextYearPeriod = true;
            this.nextYearDate = fecha;
          }

          if (fecha.getMonth() + 1 == 11 && period.typePeriod.toUpperCase() != "ANUAL") {
            this.nextYear = false;
            this.nextYearPeriod = true;
          }

          if (fecha.getMonth() + 1 == 12 && period.typePeriod.toUpperCase() == "ANUAL") {
            this.nextYear = false;
            this.nextYearPeriod = false;
            this.nextYearDate = fecha;

          }
        })
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
        data.startPeriod = data.startPeriod.substring(0, 10);
        data.endPeriod = data.endPeriod.substring(0, 10)
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

  openModal() {
    this.isPopupVisiblePeriod = true;
  }

  openModalYear() {
    this.isPopupVisibleYear = true;
  }

  openPopupYear(): void {
    this.isPopupVisibleYear = true;
  }


  closing() {

    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        this.periodService.closingPeriod(this.nextPeriod.closureType).subscribe({
          next: () => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Periodo Cerrdado Correctamente';
            this.showToast = true;

            setTimeout(() => {
              if (this.nextYearPeriod) {
                window.location.reload();
              } else {
                this.router.navigate(['/accounting/configuration/period']);
              }

            }, 3000);
          },
          error: (err) => {
            console.log(err);

            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar cerrar periodo';
            this.showToast = true;
          },
        });
      }
    }
    );
  }


  closingYear() {

    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      if (d) {

        this.periodService.closingYear(this.nextPeriod.closureType).subscribe({
          next: () => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Año Cerrdado Correctamente';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/accounting/configuration/period']);
            }, 3000);
          },
          error: (err) => {
            console.log(err);

            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar cerrar Año';
            this.showToast = true;
          },
        });
      }


    }
    );
  }


  openPopup(): void {
    this.isPopupVisiblePeriod = true;
  }

  onPopupHiding(): void {
    this.isPopupVisiblePeriod = false;
  }

  onPopupHidingYear(): void {
    this.isPopupVisibleYear = false;
  }

  onChange(period: string) {

    period = period.toUpperCase();

    const year = this.nextYearDate.getFullYear() + 1;

    switch (period) {
      case "MENSUAL":

        this.nextPeriod.startPeriod = `${year}-01-01`;
        this.nextPeriod.endPeriod = `${year}-01-31`;

        break;
      case "TRIMESTRAL":

        this.nextPeriod.startPeriod = `${year}-01-01`;
        this.nextPeriod.endPeriod = `${year}-03-31`;

        break;
      case "SEMESTRAL":
        this.nextPeriod.startPeriod = `${year}-01-01`;
        this.nextPeriod.endPeriod = `${year}-06-30`;
        break;

      default:
        break;
    }
  }

  getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  dowloadPdf(periodsClosing: any) {

    const base64Data = periodsClosing.closureReportPdf;
    if (!base64Data) {
      console.error("No se encontró el contenido Base64 del PDF.");
      return;
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = periodsClosing.startPeriod + '-' + periodsClosing.endPeriod;
    link.click();

    URL.revokeObjectURL(url);

  }


}



