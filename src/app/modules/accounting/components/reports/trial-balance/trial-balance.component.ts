import { Component, inject } from '@angular/core';
import { Options as DataSourceConfig } from 'devextreme/ui/pivot_grid/data_source';
import config from 'devextreme/core/config';
import { ReportServiceService } from 'src/app/modules/accounting/services/report-service.service';
import { TrialBalaceResponse } from 'src/app/modules/accounting/models/APIModels';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';


interface Incomes {
  id: number;
  category: string;
  accountParent: string;
  account: string;
  amount: number;
  date: Date;
}

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrl: './trial-balance.component.css'
})
export class TrialBalanceComponent {
  trialBalanceData: any[] = [];

  periodName: string = "Periodo";
  periodDate: string = "";

  private readonly reportService = inject(ReportServiceService, {
    optional: true,
  });

  constructor() { }

  ngOnInit(): void {
    this.reportService?.getTrialBalance().subscribe((data: TrialBalaceResponse) => {

      data.periods.sort((a, b) => new Date(a.startPeriod).getTime() - new Date(b.startPeriod).getTime());
      

      const filteredPeriods = data.periods.filter(period => period.closureType !== "Anual");
      
      const initialBalances = filteredPeriods[0].accountBalances.map(diary => ({
        periodName: filteredPeriods[0].closureType,
        periodDate: `${this.convertDates(filteredPeriods[0].startPeriod)} - ${this.convertDates(filteredPeriods[0].endPeriod)}`,
        accountName: diary.name,
        id:diary.id,
        debit: diary.initialBalance[0].debit,
        credit: diary.initialBalance[0].credit
      }));
    
  
      const lastPeriod = filteredPeriods[filteredPeriods.length - 1].accountBalances.map(diary => ({
        periodName: filteredPeriods[filteredPeriods.length - 1].closureType,
        periodDate: `${this.convertDates(filteredPeriods[filteredPeriods.length - 1].startPeriod)} - ${this.convertDates(filteredPeriods[filteredPeriods.length - 1].endPeriod)}`,
        accountName: diary.name,
        id:diary.id,
        debit: diary.finalBalance[0].debit,
        credit: diary.finalBalance[0].credit
      }));
    
    
      const lista = initialBalances.map(initialBalance => {
        const correspondingTransactions = filteredPeriods.map(period => {
          return period.accountBalances
            .filter(diary => diary.id === initialBalance.id) 
            .map(diary => ({
              periodName: period.closureType,
              periodDate: `${this.convertDates(period.startPeriod)} - ${this.convertDates(period.endPeriod)}`,
              accountName: diary.name,
              debit: diary.balancePeriod[0].debit,
              credit: diary.balancePeriod[0].credit
            }));
        });
    
        const correspondingLastPeriod = lastPeriod.find(lp => lp.id === initialBalance.id);
  
        return {
          name: initialBalance.accountName,
          initialBalance: {
            debit: initialBalance.debit,
            credit: initialBalance.credit
          },
          transactions: correspondingTransactions, // Las transacciones se mantienen por periodo
          lastPeriod: correspondingLastPeriod
        };
      });

      this.trialBalanceData= lista;
    
    });
    
  }



  convertDates(fecha: string): string {
    const fechaObj = new Date(fecha);
    const dia = ('0' + fechaObj.getDate()).slice(-2);
    const mes = ('0' + (fechaObj.getMonth() + 1)).slice(-2);
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  onExporting(e: DxDataGridTypes.ExportingEvent) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Balanza de Comprobacion');

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Balanza Comprobacion.xlsx');
      });
    });
  }
 

}
