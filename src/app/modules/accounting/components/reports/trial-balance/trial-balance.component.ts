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
        debit: diary.initialBalance[0].debit,
        credit: diary.initialBalance[0].credit
      }));
    
      const transactions = filteredPeriods.map(period => {
        return period.accountBalances.map(diary => ({
          periodName: period.closureType,
          periodDate: `${this.convertDates(period.startPeriod)} - ${this.convertDates(period.endPeriod)}`,
          accountName: diary.name,
          debit: diary.balancePeriod[0].debit,
          credit: diary.balancePeriod[0].credit
        }));
      });
    

      const lastPeriod = filteredPeriods[filteredPeriods.length - 1].accountBalances.map(diary => ({
        periodName: filteredPeriods[filteredPeriods.length - 1].closureType,
        periodDate: `${this.convertDates(filteredPeriods[filteredPeriods.length - 1].startPeriod)} - ${this.convertDates(filteredPeriods[filteredPeriods.length - 1].endPeriod)}`,
        accountName: diary.name,
        debit: diary.initialBalance[0].debit,
        credit: diary.initialBalance[0].credit
      }));
    
      const dataCualquiera = { initialBalances, transactions, lastPeriod };
    
      const lista = initialBalances.map(initialBalance => {
        const correspondingTransactions = filteredPeriods.map(period => {
          return period.accountBalances
            .filter(diary => diary.name === initialBalance.accountName) 
            .map(diary => ({
              periodName: period.closureType,
              periodDate: `${this.convertDates(period.startPeriod)} - ${this.convertDates(period.endPeriod)}`,
              accountName: diary.name,
              debit: diary.balancePeriod[0].debit,
              credit: diary.balancePeriod[0].credit
            }));
        });
    
        const correspondingLastPeriod = lastPeriod.find(lp => lp.accountName === initialBalance.accountName);
  
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


      for (let index = 0; index < lista.length; index++) {
        const element = lista[index];

        if (element.name =="CAJA") {
          console.log(JSON.stringify(element));
          
          
        }
        
      }
    
    });
    
  }



  convertDates(fecha: string): string {
    const fechaObj = new Date(fecha);
    const dia = ('0' + fechaObj.getDate()).slice(-2);
    const mes = ('0' + (fechaObj.getMonth() + 1)).slice(-2);
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  processBalances(dataArray: { accountBalances: any[] }[], key: keyof any, mergedData: any) {
    dataArray.forEach(item => {
      item.accountBalances.forEach(balance => {
        if (!mergedData[balance.name]) {
          mergedData[balance.name] = {
            name: balance.name,
            accountCode: balance.accountCode,
            parentName: balance.parentName,
            parentId: balance.parentId,
            initialBalance: null,
            transaction: null,
            finalBalance: null
          };
        }
        
        // Asignar los valores correspondientes
        if (key === "initialBalances" && balance.initialBalance) {
          mergedData[balance.name].initialBalance = balance.initialBalance;
        }
        if (key === "transactions" && balance.transaction) {
          mergedData[balance.name].transaction = balance.transaction;
        }
        if (key === "lastPeriod" && balance.finalBalance) {
          mergedData[balance.name].finalBalance = balance.finalBalance;
        }
      });
    });
  }

  // Función principal para combinar todos los datos
  mergeData(data: any): any {
    const mergedData: any = {};

    this.processBalances(data.initialBalances, "initialBalances", mergedData);
    this.processBalances(data.transactions, "transactions", mergedData);
    this.processBalances(data.lastPeriod, "lastPeriod", mergedData);

    return mergedData;
  }

  see(data:any){
    console.log(data);
    
  }

}
