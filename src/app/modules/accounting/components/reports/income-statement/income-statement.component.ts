import { Component, inject, OnInit } from '@angular/core';
import config from 'devextreme/core/config';
import { Options as DataSourceConfig } from 'devextreme/ui/pivot_grid/data_source';
import { IncomeStatement } from 'src/app/modules/accounting/models/APIModels';
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
    this.reportService.getIncomeStatement().subscribe((data: IncomeStatement[]) => {
      this.incomnetStatment = data;
      this.pivotDataSource = {
        fields: [
          {
            caption: 'Ingresos',
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
              console.log({ cellInfo });
              return cellInfo.valueText?.toUpperCase();
            },
          },
          {
            caption: 'Total',
            dataField: 'amount',
            dataType: 'number',
            summaryType: 'sum',
            format: 'currency',
            area: 'data',
          },
          {
            dataField: 'id',
            area: 'filter',
            visible: false,
          },
        ],
        store: this.incomnetStatment,
        // store:DATA
      };

     
    });
    
    
  }
  


}
