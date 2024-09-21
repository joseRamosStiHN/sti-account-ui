import { Component, inject } from '@angular/core';
import { Options as DataSourceConfig } from 'devextreme/ui/pivot_grid/data_source';
import config from 'devextreme/core/config';
import { ReportServiceService } from 'src/app/modules/accounting/services/report-service.service';
import { TrialBalaceResponse } from 'src/app/modules/accounting/models/APIModels';


interface Incomes {
  id: number;
  category: string;
  accountParent: string;
  account: string;
  amount: number;
  date: Date;
}

const DATA: Incomes[] = [
  {
    id: 1,
    category: 'Ingresos',
    accountParent: 'Ingresos y otras ganancias',
    account: 'Ventas y ganancias',
    amount: 5200,
    date: new Date('2023-01-02'),
  },
  {
    id: 2,
    category: 'Ingresos',
    accountParent: 'Ingresos y otras ganancias',
    account: 'Ingresos por afiliación',
    amount: 1020,
    date: new Date('2023-01-02'),
  },
  {
    id: 3,
    category: 'Costos',
    accountParent: 'Costos y otras deducciones',
    account: 'Gasolina y otras compras',
    amount: -500,
    date: new Date('2023-01-02'),
  },
  {
    id: 4,
    category: 'Costos',
    accountParent: 'Costos y otras deducciones',
    account: 'Producción y Manufactura',
    amount: -1120,
    date: new Date('2023-01-02'),
  },
  {
    id: 5,
    category: 'Costos',
    accountParent: 'Costos y otras deducciones',
    account: 'Ventas y administración',
    amount: -1455,
    date: new Date('2023-01-02'),
  },
  {
    id: 6,
    category: 'Costos',
    accountParent: 'Deudas',
    account: 'Deudas varias',
    amount: -560,
    date: new Date('2023-01-02'),
  },
  {
    id: 7,
    category: 'Costos',
    accountParent: 'Deudas',
    account: 'Deudas Por compras',
    amount: -560,
    date: new Date('2023-01-21'),
  },
  {
    id: 8,
    category: 'Costos',
    accountParent: 'Deudas',
    account: 'Deudas Por compras',
    amount: -560,
    date: new Date('2023-02-21'),
  },
  /*{
    id: 0,
    category: '',
    accountParent: '',
    account: '',
    amount: 0,
    date: undefined,
  },
  {
    id: 0,
    category: '',
    accountParent: '',
    account: '',
    amount: 0,
    date: undefined,
  },
  {
    id: 0,
    category: '',
    accountParent: '',
    account: '',
    amount: 0,
    date: undefined,
  },
  {
    id: 0,
    category: '',
    accountParent: '',
    account: '',
    amount: 0,
    date: undefined,
  }, */
];

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrl: './trial-balance.component.css'
})
export class TrialBalanceComponent {
  trialBalanceData: any[] = [];

  periodName:string= "Periodo";
  periodDate:string="";

  private readonly reportService = inject(ReportServiceService, {
    optional: true,
  });

  constructor() {}

  ngOnInit(): void {

    this.reportService?.getTrialBalance().subscribe((data: TrialBalaceResponse) => {
      this.periodName = `${data.closureType}`;
      this.periodDate = `${this.convertDates(data.startPeriod)} - ${this.convertDates(data.endPeriod)}`;


      this.trialBalanceData = data.balanceDiaries.map(diary => ({
        accountName: diary.diaryName,
        initialDebit: diary.initialBalance[0]?.debit || 0,
        initialCredit: diary.initialBalance[0]?.credit || 0,
        periodDebit: diary.balancePeriod[0]?.debit || 0, 
        periodCredit: diary.balancePeriod[0]?.credit || 0,
        finalDebit: diary.finalBalance[0]?.debit || 0,
        finalCredit: diary.finalBalance[0]?.credit || 0
      }));
    });
  }


  convertDates(fecha: string): string {
    const fechaObj = new Date(fecha);
    const dia = ('0' + fechaObj.getDate()).slice(-2);
    const mes = ('0' + (fechaObj.getMonth() + 1)).slice(-2);
    const anio = fechaObj.getFullYear();
  
    return `${dia}/${mes}/${anio}`;
  }

}
