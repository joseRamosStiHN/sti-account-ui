import { Component, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
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

  isLoading = true;  
  isProcessing = false; 
  loadMessage = 'Cargando...';

  isPopupVisiblePeriod = false;
  isPopupVisibleYear = false;
  titleNextPeriod: string = 'Proximo Período';

  closureTypeOptions = [
    { value: 'ANNUAL', text: 'Anual' },
    { value: 'MONTHLY', text: 'Mensual' },
    { value: 'WEEKLY', text: 'Semanal' }
  ];

  nextYear: boolean = false;
  nextYearPeriod: boolean = false;
  nextYearDate!: Date;

  private readonly periodService = inject(PeriodService);
  private readonly router = inject(Router);
  infoClosing?: PeriodClosing;
  periodsClosing: ClosingPeriodsAll[] = [];
  nextPeriod: NextPeridModel = {
    closureType: '',
    startPeriod: '',
    endPeriod: '',
    daysPeriod: 0
  };

  constructor() {
    // >>> NUEVO: cargar todo junto y controlar spinner
    this.isLoading = true;
    this.loadMessage = 'Cargando datos del período...';

    forkJoin({
      info: this.periodService.getInfoClosingPeriod(),
      closed: this.periodService.getAllClosing(),
      next: this.periodService.getNextPeriod()
    }).subscribe({
      next: ({ info, closed, next }) => {
        // ----- info actual -----
        this.infoClosing = info;
        const monthDate = new Date(info.endPeriod);
        let monthName = monthDate.toLocaleString('es-ES', { month: 'long' });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
        this.titleNextPeriod = `Cierre de Período ${info.typePeriod} ${monthName}`;

        // ----- periodos cerrados -----
        this.periodsClosing = closed;
        this.periodsClosing.forEach((period) => {
          const fecha = new Date(period.endPeriod);

          if (fecha.getMonth() + 1 == 12 && period.typePeriod.toUpperCase() != 'ANUAL') {
            this.nextYear = true;
            this.nextYearPeriod = true;
            this.nextYearDate = fecha;
          }

          if (fecha.getMonth() + 1 == 11 && period.typePeriod.toUpperCase() != 'ANUAL') {
            this.nextYear = false;
            this.nextYearPeriod = true;
          }

          if (fecha.getMonth() + 1 == 12 && period.typePeriod.toUpperCase() == 'ANUAL') {
            this.nextYear = false;
            this.nextYearPeriod = false;
            this.nextYearDate = fecha;
          }
        });

        // ----- siguiente período -----
        next.startPeriod = next.startPeriod.substring(0, 10);
        next.endPeriod = next.endPeriod.substring(0, 10);
        this.nextPeriod = next;
      },
      error: (err) => {
        console.error('Error al cargar datos del cierre contable', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al consultar datos de cierre';
        this.showToast = true;

        setTimeout(() => {
          this.router.navigate(['/accounting/accounting-closing']);
        }, 3000);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  openModal() {
    if (this.isProcessing) return;
    this.isPopupVisiblePeriod = true;
  }

  openModalYear() {
    if (this.isProcessing) return;
    this.isPopupVisibleYear = true;
  }

  openPopupYear(): void {
    if (this.isProcessing) return;
    this.isPopupVisibleYear = true;
  }

  closing() {
    const dialogo = confirm('¿Está seguro de que desea realizar esta acción?', 'Advertencia');
    dialogo.then((d) => {
      if (d) {
        this.isProcessing = true;
        this.loadMessage = 'Cerrando período...';

        this.periodService.closingPeriod(this.nextPeriod.closureType)
          .pipe(finalize(() => (this.isProcessing = false)))
          .subscribe({
            next: () => {
              this.toastType = typeToast.Success;
              this.messageToast = 'Período cerrado correctamente';
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
              this.messageToast = 'Error al intentar cerrar período';
              this.showToast = true;
            }
          });
      }
    });
  }

  closingYear() {
    const dialogo = confirm('¿Está seguro de que desea realizar esta acción?', 'Advertencia');
    dialogo.then((d) => {
      if (d) {
        this.isProcessing = true;
        this.loadMessage = 'Cerrando año contable...';

        this.periodService.closingYear(this.nextPeriod.closureType)
          .pipe(finalize(() => (this.isProcessing = false)))
          .subscribe({
            next: () => {
              this.toastType = typeToast.Success;
              this.messageToast = 'Año cerrado correctamente';
              this.showToast = true;

              setTimeout(() => {
                this.router.navigate(['/accounting/configuration/period']);
              }, 3000);
            },
            error: (err) => {
              console.log(err);
              this.toastType = typeToast.Error;
              this.messageToast = 'Error al intentar cerrar año';
              this.showToast = true;
            }
          });
      }
    });
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
      case 'MENSUAL':
        this.nextPeriod.startPeriod = `${year}-01-01`;
        this.nextPeriod.endPeriod = `${year}-01-31`;
        break;
      case 'TRIMESTRAL':
        this.nextPeriod.startPeriod = `${year}-01-01`;
        this.nextPeriod.endPeriod = `${year}-03-31`;
        break;
      case 'SEMESTRAL':
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
      console.error('No se encontró el contenido Base64 del PDF.');
      return;
    }
    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
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
