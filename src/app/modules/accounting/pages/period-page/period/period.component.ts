import { DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { PeriodsRequest, PeriodsResponse } from 'src/app/modules/accounting/models/APIModels';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';


@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrl: './period.component.css'
})
export class PeriodComponent {

  @Input('id') id?: string;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  periodForm: PeriodModel;
  typePeriodList: string[] = ['Mensual', 'Trimestral', 'Semestral', 'Personalizado', 'Anual'];

  public activatePeriodo: boolean = true;


  private readonly router = inject(Router);
  private readonly periodService = inject(PeriodService);


  constructor() {
    this.periodForm = {
      startPeriod: null as Date | null,
      closureType: "",
      status: false,
      periodStatus: "ACTIVE",
      isAnnual: false
    };
  }

  ngOnInit(): void {

    const findId = Number(this.id);
    if (findId) {
      this.periodService.getPeriodById(findId).subscribe({
        next: (periods) => {

          if (periods.closureType.toLocaleUpperCase() == "ANUAL") {
            periods.status = true;
          }
          this.periodForm = periods
          this.activatePeriodo = this.periodForm.status
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = 'Ups error al obtener datos del period';
          this.showToast = true;
          console.error('Error al obtener datos categorias', err)
          this.redirectTo();
        }
      }
      );
    }

  }


  async save(e: NgForm) {

    if (!e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor, complete todos los campos requeridos.';
      this.showToast = true;
      return;
    }

    if (e.valid && this.validationDate(e)) {
      let dialogo = await confirm(`¿Está seguro de que desea realizar esta acción?`, 'Advertencia');
      if (!dialogo) {
        return;
      }


      if (this.id) {
        this.updatePerido();
      } else {
        this.createPeriod();
      }
    };

  }


  updatePerido() {

    const startPeriod = this.toLocalDateTime(this.periodForm.startPeriod);

    const request = { ...this.periodForm, startPeriod };



    this.periodService.updatePeriod(Number(this.id), request).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros actualizados exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 1000);
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo';
        this.showToast = true;
      },
    });
  }

  createPeriod() {

    const startPeriod = this.toLocalDateTime(this.periodForm.startPeriod);

    const request = { ...this.periodForm, startPeriod };


    this.periodService.createPeriod(request).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros insertados exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 1000);

      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo';
        this.showToast = true;
      },
    });
  }

  goBack() {
    this.router.navigate(['/accounting/configuration/period']);
  }

  validationDate(e: NgForm) {

    let initDateFormat = e.value.startPeriod.split('-');
    let init = new Date(Number(initDateFormat[0]), Number(initDateFormat[1]) - 1, Number(initDateFormat[2]));
    let endDateFormat;
    let end;
    this.periodForm.startPeriod = init;
    if (this.periodForm.closureType == "Personalizado") {
      endDateFormat = e.value.endPeriod.split('-');
      end = new Date(Number(endDateFormat[0]), Number(endDateFormat[1]) - 1, Number(endDateFormat[2]));
      if (this.validateDays(init, end)) {
        this.toastType = typeToast.Warning;
        this.messageToast = 'La fecha incial no puede ser menor ala final';
        this.showToast = true;
        return false;
      }

      let differenceInTime = end.getTime() - init.getTime();
      let days = differenceInTime / (1000 * 3600 * 24);
      this.periodForm.daysPeriod = days;
      this.periodForm.endPeriod = end;

    }
    return true
  }

  validateDays(initial: Date, final: Date): boolean {
    if (initial <= final) {
      return false;
    }
    return true;
  }

  redirectTo() {
    setTimeout(() => {
      this.router.navigate(['/accounting/configuration/period']);
    }, 2000);
  }


  toLocalDateTime(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };



}
