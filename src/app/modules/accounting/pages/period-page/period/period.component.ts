import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';



const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const pastNow = new Date();
const initialValue: [Date, Date] = [
  new Date(pastNow.getTime()),
  new Date(now.getTime() + msInDay * 30),
];

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrl: './period.component.css'
})
export class PeriodComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  periodForm: PeriodModel;
  periodList: string[] = ['mensual', 'trimestral', 'semestral', 'anual'];
  currentValue!: (string | number | Date)[];
  id: string | null = null;

  private readonly router = inject(Router);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly periodService = inject(PeriodService);

  constructor() {
    this.currentValue = [new Date(), new Date()];
    this.periodForm = {
      name: "",
      startDate: "",
      endDate: "",
      typePeriod: "",
      status: false
    };
  }

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {
        this.periodService.getPeriodById(findId).subscribe({

          next: (data) => this.fillPeriod(data),
        });
      }
    });
  }


  changeDate(event: string) {
    if (event == 'mensual') {
      let initialMensual = [
        new Date(pastNow.getTime()),
        new Date(now.getTime() + msInDay * 30),
      ];
      this.currentValue = initialMensual;
    } else if (event == 'trimestral') {
      let initialMensual = [
        new Date(pastNow.getTime()),
        new Date(now.getTime() + msInDay * 90),
      ];
      this.currentValue = initialMensual;

    } else if (event == 'semestral') {
      let initialMensual = [
        new Date(pastNow.getTime()),
        new Date(now.getTime() + msInDay * 180),
      ];
      this.currentValue = initialMensual;

    } else if (event == 'anual') {
      let initialMensual = [
        new Date(pastNow.getTime()),
        new Date(now.getTime() + msInDay * 365),
      ];
      this.currentValue = initialMensual;

    }
  }



  async save(e: NgForm) {

    if (e.valid && this.validate()) {
      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );
      if (!dialogo) {
        return;
      }

      if (this.id) {
        this.periodService.updatePeriod(Number(this.id),this.periodForm).subscribe({
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
        
      }else{
        this.periodService.createPeriod(this.periodForm).subscribe({
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
    };

  }

  currentValueChanged(event: any): void {
    this.currentValue = event.value;
  };

  goBack() {
    this.router.navigate(['accounting/period-list']);
  }


  private fillPeriod(data: PeriodModel): void {

    this.periodForm.name = data.name;
    this.periodForm.startDate = data.startDate;
    this.periodForm.endDate = data.endDate;
    this.currentValue = [new Date(data.startDate), new Date(data.endDate)];
    this.periodForm.typePeriod = data.typePeriod.toLocaleLowerCase();
    this.periodForm.status = data.status;

  }


  private validate(): boolean {
    this.messageToast = '';
    this.showToast = false;
    const [initialDate, endDate] = this.currentValue;
    const now = new Date();
    if (this.formateDate(initialDate) < this.formateDate(now)) {
      this.messageToast = 'Fecha inicial no debe ser menor ala actual';
      this.showToast = true;
      this.toastType = typeToast.Warning;
      return false;
    }
    if (this.validateDays(initialDate, endDate, this.periodForm.typePeriod)) {
      this.messageToast = 'Fecha final no debe ser mayor al periodo establecido';
      this.showToast = true;
      this.toastType = typeToast.Warning;
      return false;
    }
    return true;
  }

  private validateDays(initialDate: any, endDate: any, type: string): boolean {
    const dateStart = this.formateDate(initialDate);
    const dateEnd = this.formateDate(endDate);
    const differenceInMs = dateEnd.getTime() - dateStart.getTime();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const differenceInDays = Math.floor(differenceInMs / millisecondsPerDay);
    

    if (type == 'mensual' && differenceInDays <= 30) {
      return false;
    }
    if (type == 'trimestral' && differenceInDays <= 90) {
      return false;
    }
    if (type == 'semestral' && differenceInDays <= 180) {
      return false;
    }
    if (type == 'anual' && differenceInDays <= 365) {
      return false;
    }
    return true;

  }


  formateDate(date: any): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

}
