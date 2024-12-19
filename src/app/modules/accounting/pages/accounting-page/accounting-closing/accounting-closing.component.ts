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
    this.isPopupVisible = true;
  }


  closing() {

    console.log(this.nextPeriod);

    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {

      this.periodService.closingPeriod(this.nextPeriod.closureType).subscribe({
        next: () => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Periodo Cerrdado Correctamente';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/configuration/period']);
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
    );
  }


  openPopup(): void {
    this.isPopupVisible = true;
  }

  onPopupHiding(): void {
    this.isPopupVisible = false;
  }

  onChange() {
    console.log(this.nextPeriod);

    this.calculateEndDate(this.nextPeriod)
  }

  calculateEndDate(object: any) {


    const { closureType, startPeriod } = object;

    const startDate = new Date(`${startPeriod}T00:00:00-06:00`);

    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    let endMonth = startMonth;
    let endYear = startYear;


    switch (closureType) {
      case 'Mensual':
        endMonth += 0;
        break;
      case 'Trimestral':
        endMonth += 2;
        break;
      case 'Semestral':
        endMonth += 5;
        break;
    }

    if (closureType === 'Trimestral' && endMonth == 12) {
      endMonth = 11;
      endYear = startYear;

    }

    if (closureType === 'Semestral' && endMonth > 6) {

      endMonth = 11;
      endYear = startYear;

    }

    if (endMonth > 11) {
      endYear += Math.floor(endMonth / 12);
      endMonth %= 12;
    }


    const lastDay = this.getLastDayOfMonth(endYear, endMonth);


    const endDate = new Date(endYear, endMonth, lastDay);


    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));


    object.endPeriod = endDate.toISOString().substring(0, 10);
    object.startPeriod = startDate.toISOString().substring(0, 10);
    object.daysPeriod = diffDays;

    return object;
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



