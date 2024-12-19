import { Component, inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import config from 'devextreme/core/config';
import { Options as DataSourceConfig } from 'devextreme/ui/pivot_grid/data_source';
import { map, Observable } from 'rxjs';
import { IncomeStatement } from 'src/app/modules/accounting/models/APIModels';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { ReportServiceService } from 'src/app/modules/accounting/services/report-service.service';

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
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
  styleUrl: './income-statement.component.css',
})
export class IncomeStatementComponent implements OnInit {
  pivotDataSource!: DataSourceConfig;
  incomnetStatment:IncomeStatement[]= [];
  selectedPeriod: number = 0;
  

  periodList$: Observable<PeriodModel[]> | undefined;

  private readonly periodoService = inject(PeriodService);
  private readonly reportService = inject(ReportServiceService);


  constructor() {
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
      forceIsoDateParsing: true,
    });
  }

  ngOnInit(): void {
    this.reportService.getIncomeStatement(0).subscribe((data: IncomeStatement[]) => {
      this.incomnetStatment = data;
      this.pivotDataSource = {
        fields: [
          {
            caption: 'Ingresos/Gastos',
            dataField: 'category',
            area: 'row',
            expanded: true,
            sortOrder: 'desc',
            width: 200,
          },
          {
            caption: 'Cuenta Padre',
            dataField: 'accountParent',
            width: 250,
            area: 'row',
            expanded: false,
          },
          {
            caption: 'Cuenta',
            dataField: 'account',
            area: 'row',
            width: 200,
            expanded: false,
          },
          {
            caption: 'Fecha',
            dataField: 'date',
            area: 'column',
          },
          {
            groupName: 'date',
            groupInterval: 'quarter',
            visible: false,
            customizeText: function (cellInfo: any) {
              return cellInfo.valueText?.toUpperCase();
            },
          },
          {
            caption: 'Total',
            dataType: 'number',
            summaryType: 'custom',
            format: 'currency',
            area: 'data',
            calculateCustomSummary: function (options: any) {
              if (options.summaryProcess === 'start') {
                options.totalValue = { debit: 0, credit: 0 }; // Inicializamos los totales
              }
              if (options.summaryProcess === 'calculate') {
                // Sumar valores según typicalBalance
                if (options.value.typicalBalance === 'D') {
                  options.totalValue.debit += options.value.amount; // Sumar débitos
                } else if (options.value.typicalBalance === 'C') {
                  options.totalValue.credit += options.value.amount; // Sumar créditos
                }
              }
              if (options.summaryProcess === 'finalize') {
                // Total final
                options.totalValue = options.totalValue.credit - options.totalValue.debit; // Resultado final
              }
            },
            customizeText: function (cellInfo: any) {
              const formatter = new Intl.NumberFormat('es-HN', {
                style: 'currency',
                currency: 'HNL',
                minimumFractionDigits: 2,
              });
              if (cellInfo.value < 0) {
                return formatter.format(Math.abs(cellInfo.value)); // Display negative values as positive
              } else {
                return formatter.format(cellInfo.value); // Display positive values as is
              }
            }
          },
          {
            dataField: 'id',
            area: 'filter',
            visible: false,
          },
        ],
        store: this.incomnetStatment,
      };
    });

    this.periodList$ = this.periodoService.getAllPeriods().pipe(
      map(data => {
        data.map(nuevo => {
          const status = nuevo.closureType?.toUpperCase() == "ANUAL" ? nuevo.status = true : nuevo.status;
          const isClosed = nuevo.isClosed == null ? false : true;
          return { ...nuevo, status, isClosed }
        })
        return data
      })
    );
  }

  async onSubmit(e: NgForm) {

    console.log(e.form.value.period);
    
    if (e.valid) {

      this.reportService.getIncomeStatement(e.form.value.period).subscribe((data: IncomeStatement[]) => {
        this.incomnetStatment = data;
        this.pivotDataSource = {
          fields: [
            {
              caption: 'Ingresos/Gastos',
              dataField: 'category',
              area: 'row',
              expanded: true,
              sortOrder: 'desc',
              width: 200,
            },
            {
              caption: 'Cuenta Padre',
              dataField: 'accountParent',
              width: 250,
              area: 'row',
              expanded: false,
            },
            {
              caption: 'Cuenta',
              dataField: 'account',
              area: 'row',
              width: 200,
              expanded: false,
            },
            {
              caption: 'Fecha',
              dataField: 'date',
              area: 'column',
            },
            {
              groupName: 'date',
              groupInterval: 'quarter',
              visible: false,
              customizeText: function (cellInfo: any) {
                return cellInfo.valueText?.toUpperCase();
              },
            },
            {
              caption: 'Total',
              dataType: 'number',
              summaryType: 'custom',
              format: 'currency',
              area: 'data',
              calculateCustomSummary: function (options: any) {
                if (options.summaryProcess === 'start') {
                  options.totalValue = { debit: 0, credit: 0 }; // Inicializamos los totales
                }
                if (options.summaryProcess === 'calculate') {
                  // Sumar valores según typicalBalance
                  if (options.value.typicalBalance === 'D') {
                    options.totalValue.debit += options.value.amount; // Sumar débitos
                  } else if (options.value.typicalBalance === 'C') {
                    options.totalValue.credit += options.value.amount; // Sumar créditos
                  }
                }
                if (options.summaryProcess === 'finalize') {
                  // Total final
                  options.totalValue = options.totalValue.credit - options.totalValue.debit; // Resultado final
                }
              },
              customizeText: function (cellInfo: any) {
                const formatter = new Intl.NumberFormat('es-HN', {
                  style: 'currency',
                  currency: 'HNL',
                  minimumFractionDigits: 2,
                });
                if (cellInfo.value < 0) {
                  return formatter.format(Math.abs(cellInfo.value)); // Display negative values as positive
                } else {
                  return formatter.format(cellInfo.value); // Display positive values as is
                }
              }
            },
            {
              dataField: 'id',
              area: 'filter',
              visible: false,
            },
          ],
          store: this.incomnetStatment,
        };
      });
    }


  }
  
  
  
  
  
  
  
  
  


}

  



