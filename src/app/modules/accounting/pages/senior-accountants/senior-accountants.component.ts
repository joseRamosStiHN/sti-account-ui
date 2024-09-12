import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { AccountAPIResponse } from 'src/app/modules/accounting/models/APIModels';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { Detail, LeaderAccounts } from 'src/app/modules/accounting/models/LeederAccountsDetail';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
// export interface Order {
//   ID: number;

//   OrderNumber: number;

//   OrderDate: string;

//   SaleAmount: number;

//   TotalAmount: number;

//   Terms: string;

//   CustomerStoreState: string;

//   CustomerStoreCity: string;

//   Employee: string;
// }
export interface Order {
  ID: number;
  account: number;
  name: string;
  OrderDate: string;
  date: number;
  description: number;
  debito: number;
  credito: number;
  balance: number;
  accountFatherName:string;
}

@Component({
  selector: 'app-senior-accountants',
  templateUrl: './senior-accountants.component.html',
  styleUrl: './senior-accountants.component.css'
})
export class SeniorAccountantsComponent {

  // @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  // searchEnabled = true;

  // editorOptions = { placeholder: 'Search column' };

  // allowSelectAll = true;

  // selectByClick = true;

  // recursive = true;

  // columnChooserModes = [{
  //   key: 'dragAndDrop',
  //   name: 'Drag and drop',
  // }, {
  //   key: 'select',
  //   name: 'Select',
  // }];



  // tranactionList$: LeaderAccounts[] =[]

  // loadingData: boolean = true;
  // /*injections */
  // private readonly router = inject(Router);
  // private readonly transactionService = inject(TransactionService);

  // constructor(private cdr: ChangeDetectorRef) { }

  // ngOnInit(): void {
  //    this.transactionService.getAllLedgerAcounts().subscribe((data)=>

  //      this.tranactionList$ = data
  //     );
  // }

  // onEditAccount(e: Detail) {

  //   if (e.accountType == JournalTypes.Ventas) {
  //     this.router.navigate(['/accounting/client-invoicing',e.transactionId]);
  //   }

  //   if (e.accountType == JournalTypes.Compras) {
  //     this.router.navigate(['/accounting/provider-invoicing',e.transactionId]);
  //   } 

  // }

  // goToNewAccount = () => {
  //   this.router.navigate(['/accounting/configuration/new-account']);
  // };

  // see(data: any) {

  //   console.log(data);

  // }

  // goBack() {
  //   window.history.back();
  //  }

 
  // orders: Order[];

  // constructor() {
  //   this.orders = 
  //   [{
  //     ID: 1,
  //     OrderNumber: 35703,
  //     OrderDate: '2014-04-10',
  //     SaleAmount: 11800,
  //     Terms: '15 Days',
  //     TotalAmount: 12175,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Los Angeles',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 4,
  //     OrderNumber: 35711,
  //     OrderDate: '2014-01-12',
  //     SaleAmount: 16050,
  //     Terms: '15 Days',
  //     TotalAmount: 16550,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'San Jose',
  //     Employee: 'Jim Packard',
  //   }, {
  //     ID: 5,
  //     OrderNumber: 35714,
  //     OrderDate: '2014-01-22',
  //     SaleAmount: 14750,
  //     Terms: '15 Days',
  //     TotalAmount: 15250,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 7,
  //     OrderNumber: 35983,
  //     OrderDate: '2014-02-07',
  //     SaleAmount: 3725,
  //     Terms: '15 Days',
  //     TotalAmount: 3850,
  //     CustomerStoreState: 'Colorado',
  //     CustomerStoreCity: 'Denver',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 9,
  //     OrderNumber: 36987,
  //     OrderDate: '2014-03-11',
  //     SaleAmount: 14200,
  //     Terms: '15 Days',
  //     TotalAmount: 14800,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 11,
  //     OrderNumber: 38466,
  //     OrderDate: '2014-03-01',
  //     SaleAmount: 7800,
  //     Terms: '15 Days',
  //     TotalAmount: 8200,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Los Angeles',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 15,
  //     OrderNumber: 39874,
  //     OrderDate: '2014-02-04',
  //     SaleAmount: 9050,
  //     Terms: '30 Days',
  //     TotalAmount: 19100,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 18,
  //     OrderNumber: 42847,
  //     OrderDate: '2014-02-15',
  //     SaleAmount: 20400,
  //     Terms: '30 Days',
  //     TotalAmount: 20800,
  //     CustomerStoreState: 'Wyoming',
  //     CustomerStoreCity: 'Casper',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 19,
  //     OrderNumber: 43982,
  //     OrderDate: '2014-05-29',
  //     SaleAmount: 6050,
  //     Terms: '30 Days',
  //     TotalAmount: 6250,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 29,
  //     OrderNumber: 56272,
  //     OrderDate: '2014-02-06',
  //     SaleAmount: 15850,
  //     Terms: '30 Days',
  //     TotalAmount: 16350,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 30,
  //     OrderNumber: 57429,
  //     OrderDate: '2013-12-31',
  //     SaleAmount: 11050,
  //     Terms: '30 Days',
  //     TotalAmount: 11400,
  //     CustomerStoreState: 'Arizona',
  //     CustomerStoreCity: 'Phoenix',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 32,
  //     OrderNumber: 58292,
  //     OrderDate: '2014-05-13',
  //     SaleAmount: 13500,
  //     Terms: '15 Days',
  //     TotalAmount: 13800,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Los Angeles',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 36,
  //     OrderNumber: 62427,
  //     OrderDate: '2014-01-27',
  //     SaleAmount: 23500,
  //     Terms: '15 Days',
  //     TotalAmount: 24000,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 39,
  //     OrderNumber: 65977,
  //     OrderDate: '2014-02-05',
  //     SaleAmount: 2550,
  //     Terms: '15 Days',
  //     TotalAmount: 2625,
  //     CustomerStoreState: 'Wyoming',
  //     CustomerStoreCity: 'Casper',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 40,
  //     OrderNumber: 66947,
  //     OrderDate: '2014-03-23',
  //     SaleAmount: 3500,
  //     Terms: '15 Days',
  //     TotalAmount: 3600,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 42,
  //     OrderNumber: 68428,
  //     OrderDate: '2014-04-10',
  //     SaleAmount: 10500,
  //     Terms: '15 Days',
  //     TotalAmount: 10900,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Los Angeles',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 43,
  //     OrderNumber: 69477,
  //     OrderDate: '2014-03-09',
  //     SaleAmount: 14200,
  //     Terms: '15 Days',
  //     TotalAmount: 14500,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Anaheim',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 46,
  //     OrderNumber: 72947,
  //     OrderDate: '2014-01-14',
  //     SaleAmount: 13350,
  //     Terms: '30 Days',
  //     TotalAmount: 13650,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 47,
  //     OrderNumber: 73088,
  //     OrderDate: '2014-03-25',
  //     SaleAmount: 8600,
  //     Terms: '30 Days',
  //     TotalAmount: 8850,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Reno',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 50,
  //     OrderNumber: 76927,
  //     OrderDate: '2014-04-27',
  //     SaleAmount: 9800,
  //     Terms: '30 Days',
  //     TotalAmount: 10050,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 51,
  //     OrderNumber: 77297,
  //     OrderDate: '2014-04-30',
  //     SaleAmount: 10850,
  //     Terms: '30 Days',
  //     TotalAmount: 11100,
  //     CustomerStoreState: 'Arizona',
  //     CustomerStoreCity: 'Phoenix',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 56,
  //     OrderNumber: 84744,
  //     OrderDate: '2014-02-10',
  //     SaleAmount: 4650,
  //     Terms: '30 Days',
  //     TotalAmount: 4750,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 57,
  //     OrderNumber: 85028,
  //     OrderDate: '2014-05-17',
  //     SaleAmount: 2575,
  //     Terms: '30 Days',
  //     TotalAmount: 2625,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Reno',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 59,
  //     OrderNumber: 87297,
  //     OrderDate: '2014-04-21',
  //     SaleAmount: 14200,
  //     Terms: '30 Days',
  //     TotalAmount: 0,
  //     CustomerStoreState: 'Wyoming',
  //     CustomerStoreCity: 'Casper',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 60,
  //     OrderNumber: 88027,
  //     OrderDate: '2014-02-14',
  //     SaleAmount: 13650,
  //     Terms: '30 Days',
  //     TotalAmount: 14050,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 65,
  //     OrderNumber: 94726,
  //     OrderDate: '2014-05-22',
  //     SaleAmount: 20500,
  //     Terms: '15 Days',
  //     TotalAmount: 20800,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'San Jose',
  //     Employee: 'Jim Packard',
  //   }, {
  //     ID: 66,
  //     OrderNumber: 95266,
  //     OrderDate: '2014-03-10',
  //     SaleAmount: 9050,
  //     Terms: '15 Days',
  //     TotalAmount: 9250,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 69,
  //     OrderNumber: 98477,
  //     OrderDate: '2014-01-01',
  //     SaleAmount: 23500,
  //     Terms: '15 Days',
  //     TotalAmount: 23800,
  //     CustomerStoreState: 'Wyoming',
  //     CustomerStoreCity: 'Casper',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 70,
  //     OrderNumber: 99247,
  //     OrderDate: '2014-02-08',
  //     SaleAmount: 2100,
  //     Terms: '15 Days',
  //     TotalAmount: 2150,
  //     CustomerStoreState: 'Utah',
  //     CustomerStoreCity: 'Salt Lake City',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 78,
  //     OrderNumber: 174884,
  //     OrderDate: '2014-04-10',
  //     SaleAmount: 7200,
  //     Terms: '30 Days',
  //     TotalAmount: 7350,
  //     CustomerStoreState: 'Colorado',
  //     CustomerStoreCity: 'Denver',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 81,
  //     OrderNumber: 188877,
  //     OrderDate: '2014-02-11',
  //     SaleAmount: 8750,
  //     Terms: '30 Days',
  //     TotalAmount: 8900,
  //     CustomerStoreState: 'Arizona',
  //     CustomerStoreCity: 'Phoenix',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 82,
  //     OrderNumber: 191883,
  //     OrderDate: '2014-02-05',
  //     SaleAmount: 9900,
  //     Terms: '30 Days',
  //     TotalAmount: 10150,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Los Angeles',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 83,
  //     OrderNumber: 192474,
  //     OrderDate: '2014-01-21',
  //     SaleAmount: 12800,
  //     Terms: '30 Days',
  //     TotalAmount: 13100,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'Anaheim',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 84,
  //     OrderNumber: 193847,
  //     OrderDate: '2014-03-21',
  //     SaleAmount: 14100,
  //     Terms: '30 Days',
  //     TotalAmount: 14350,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'San Diego',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 85,
  //     OrderNumber: 194877,
  //     OrderDate: '2014-03-06',
  //     SaleAmount: 4750,
  //     Terms: '30 Days',
  //     TotalAmount: 4950,
  //     CustomerStoreState: 'California',
  //     CustomerStoreCity: 'San Jose',
  //     Employee: 'Jim Packard',
  //   }, {
  //     ID: 86,
  //     OrderNumber: 195746,
  //     OrderDate: '2014-05-26',
  //     SaleAmount: 9050,
  //     Terms: '30 Days',
  //     TotalAmount: 9250,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Las Vegas',
  //     Employee: 'Harv Mudd',
  //   }, {
  //     ID: 87,
  //     OrderNumber: 197474,
  //     OrderDate: '2014-03-02',
  //     SaleAmount: 6400,
  //     Terms: '30 Days',
  //     TotalAmount: 6600,
  //     CustomerStoreState: 'Nevada',
  //     CustomerStoreCity: 'Reno',
  //     Employee: 'Clark Morgan',
  //   }, {
  //     ID: 88,
  //     OrderNumber: 198746,
  //     OrderDate: '2014-05-09',
  //     SaleAmount: 15700,
  //     Terms: '30 Days',
  //     TotalAmount: 16050,
  //     CustomerStoreState: 'Colorado',
  //     CustomerStoreCity: 'Denver',
  //     Employee: 'Todd Hoffman',
  //   }, {
  //     ID: 91,
  //     OrderNumber: 214222,
  //     OrderDate: '2014-02-08',
  //     SaleAmount: 11050,
  //     Terms: '30 Days',
  //     TotalAmount: 11250,
  //     CustomerStoreState: 'Arizona',
  //     CustomerStoreCity: 'Phoenix',
  //     Employee: 'Clark Morgan',
  //   }];
  // }
  orders: Order[];
  constructor() {
    this.orders = [
      {
        "ID": 1,
        "account": 101,
        "accountFatherName": "Bancos",
        "name": "Banco Atlantidad",
        "OrderDate": "2024-09-01T14:30:00Z",
        "date": 20240901,
        "description": 1001,
        "debito": 500.0,
        "credito": 0.0,
        "balance": 500.0
      },
      {
        "ID": 2,
        "account": 102,
        "accountFatherName": "Bancos",
        "name": "Banco Pato",
        "OrderDate": "2024-09-02T09:00:00Z",
        "date": 20240902,
        "description": 1002,
        "debito": 700.0,
        "credito": 0.0,
        "balance": 700.0
      },
      {
        "ID": 3,
        "account": 103,
        "accountFatherName": "Bancos",
        "name": "Banco Carro",
        "OrderDate": "2024-09-03T16:45:00Z",
        "date": 20240903,
        "description": 1003,
        "debito": 1000.0,
        "credito": 300.0,
        "balance": 700.0
      },
      {
        "ID": 4,
        "account": 201,
        "accountFatherName": "Cuentas por Cobrar",
        "name": "Clientes Nacionales",
        "OrderDate": "2024-09-04T11:20:00Z",
        "date": 20240904,
        "description": 2001,
        "debito": 1500.0,
        "credito": 500.0,
        "balance": 1000.0
      },
      {
        "ID": 5,
        "account": 202,
        "accountFatherName": "Cuentas por Cobrar",
        "name": "Clientes Internacionales",
        "OrderDate": "2024-09-05T13:15:00Z",
        "date": 20240905,
        "description": 2002,
        "debito": 2000.0,
        "credito": 1000.0,
        "balance": 1000.0
      },
      {
        "ID": 6,
        "account": 301,
        "accountFatherName": "Cuentas por Pagar",
        "name": "Proveedores Locales",
        "OrderDate": "2024-09-06T08:00:00Z",
        "date": 20240906,
        "description": 3001,
        "debito": 0.0,
        "credito": 1500.0,
        "balance": -1500.0
      },
      {
        "ID": 7,
        "account": 302,
        "accountFatherName": "Cuentas por Pagar",
        "name": "Proveedores Extranjeros",
        "OrderDate": "2024-09-07T10:30:00Z",
        "date": 20240907,
        "description": 3002,
        "debito": 0.0,
        "credito": 2000.0,
        "balance": -2000.0
      },
      {
        "ID": 8,
        "account": 303,
        "accountFatherName": "Cuentas por Pagar",
        "name": "Impuestos Nacionales",
        "OrderDate": "2024-09-08T15:45:00Z",
        "date": 20240908,
        "description": 3003,
        "debito": 0.0,
        "credito": 500.0,
        "balance": -500.0
      },
      {
        "ID": 9,
        "account": 401,
        "accountFatherName": "Ingresos",
        "name": "Ventas Nacionales",
        "OrderDate": "2024-09-09T12:00:00Z",
        "date": 20240909,
        "description": 4001,
        "debito": 1000.0,
        "credito": 0.0,
        "balance": 1000.0
      },
      {
        "ID": 10,
        "account": 402,
        "accountFatherName": "Ingresos",
        "name": "Ventas Internacionales",
        "OrderDate": "2024-09-10T17:30:00Z",
        "date": 20240910,
        "description": 4002,
        "debito": 2000.0,
        "credito": 0.0,
        "balance": 2000.0
      }
    ]
    
  }


 

}
