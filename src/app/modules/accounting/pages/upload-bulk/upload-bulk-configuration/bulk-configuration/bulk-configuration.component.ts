import { Component, inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { BulkDetailType, ClientBilling, IMovement, typeToast, UploadBulkSettingsModel } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { UploadBulkService } from 'src/app/modules/accounting/services/upload-bulk.service';

@Component({
  selector: 'app-bulk-configuration',
  templateUrl: './bulk-configuration.component.html',
  styleUrl: './bulk-configuration.component.css'
})
export class BulkConfigurationComponent {

  BulkConfiguration: UploadBulkSettingsModel;
  colums: any = [
    { colum: "A", value: 0 },
    { colum: "B", value: 1 },
    { colum: "C", value: 2 },
    { colum: "D", value: 3 },
    { colum: "E", value: 4 },
    { colum: "F", value: 5 },
    { colum: "G", value: 6 },
    { colum: "H", value: 7 },
    { colum: "I", value: 8 },
    { colum: "J", value: 9 },
    { colum: "K", value: 10 },
    { colum: "L", value: 11 },
    { colum: "M", value: 12 },
    { colum: "N", value: 13 },
    { colum: "O", value: 14 },
    { colum: "P", value: 15 },
    { colum: "Q", value: 16 },
    { colum: "R", value: 17 },
    { colum: "S", value: 18 },
    { colum: "T", value: 19 }
  ];

  listMovement: IMovement[] = [
    {
      code: 'D',
      name: 'Debe',
    },
    {
      code: 'C',
      name: 'Haber',
    },
  ];


  tableFields = [
    { key: "CASH", value: 'CONTADO' },
    { key: "CREDIT_VALUE", value: 'CREDITO' },
    { key: "CURRENCY", value: 'MONEDA' },
    { key: "DATE", value: 'FECHA' },
    { key: "DESCRIPTION", value: 'DESCRIPCION' },
    { key: "TIPO_CAMBIO", value: 'TIPO CAMBIO' },
    { key: "REFERENCE", value: 'FACTURA' },
    { key: "RTN", value: 'RTN' },
    { key: "SUPPLIER_value", value: 'NOMBRE COMPRADOR/VENDEDOR' },
    { key: "TYPE_PAYMENT", value: 'TIPO PAGO TARJETA/EFECTIVO' },
    { key: "TYPE_SALE", value: 'TYPO VENTA CONTADO/CREDITO' },
  ];

  configDefaultSales = [
    {
      colum: 1,
      title: "FACTURA",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "REFERENCE"
    },
    {
      colum: 2,
      title: "DETALLE",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "DESCRIPTION"
    },
    {
      colum: 0,
      title: "FECHA",
      bulkTypeData: BulkDetailType.DT,
      account: null,
      operation: null,
      field: "DATE"
    },
    {
      colum: 7,
      title: "TIPO-VENTA",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "TYPE_SALE"
    },
    {
      colum: 10,
      title: "TIPO-PAGO",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "TYPE_PAYMENT"
    },
    {
      colum: 8,
      title: "VALOR-CONTADO",
      bulkTypeData: BulkDetailType.N,
      account: null,
      operation: null,
      field: "CASH"
    },
    {
      colum: 9,
      title: "VALOR-CREDITO",
      bulkTypeData: BulkDetailType.N,
      account: null,
      operation: null,
      field: "CREDIT_VALUE"
    },
    {
      colum: 11,
      title: "CON-RTN",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "RTN"
    }
  ]

  configDefaultBuys = [
    {
      colum: 1,
      title: "FACTURA",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "REFERENCE"
    },
    {
      colum: 3,
      title: "DETALLE",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "DESCRIPTION"
    },
    {
      colum: 0,
      title: "FECHA",
      bulkTypeData: BulkDetailType.DT,
      account: null,
      operation: null,
      field: "DATE"
    },
    {
      colum: 8,
      title: "TIPO-COMPRA",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "TYPE_SALE"
    },
    {
      colum: 11,
      title: "TIPO-PAGO",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "TYPE_PAYMENT"
    },
    {
      colum: 9,
      title: "VALOR-CONTADO",
      bulkTypeData: BulkDetailType.N,
      account: null,
      operation: null,
      field: "CASH"
    },
    {
      colum: 10,
      title: "VALOR-CREDITO",
      bulkTypeData: BulkDetailType.N,
      account: null,
      operation: null,
      field: "CREDIT_VALUE"
    },
    {
      colum: 12,
      title: "CON-RTN",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
      field: "RTN"
    }
  ]

  typeData = [
    { key: "S", value: 'TEXTO' },
    { key: "N", value: 'NUMERICO' },
    { key: "DT", value: 'FECHA' },
  ];

  @Input('id') id?:number;

  accountList: AccountModel[] = [];
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  private readonly accountService = inject(AccountService);
  private readonly bulkSettingsService = inject(UploadBulkService);
  private readonly router = inject(Router);

  constructor() {
    this.BulkConfiguration = {
      name: "",
      type: null,
      rowInit: null,
      configDetails: []
    };


  }

  ngOnInit(): void {

    if (this.id) {
       this.bulkSettingsService.getBulkConfigurationById(this.id).subscribe(data=>
        this.BulkConfiguration = data
       );
    }

    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => {
            return item.supportEntry && item.balances.length > 0
          })
          .map(item => ({
            id: item.id,
            description: item.name,
            code: item.accountCode
          } as AccountModel));
      },
    });

  }


  async onSubmit(e: NgForm) {

    if (e.valid) {
      const validationErrors = this.validateUniqueFields(this.BulkConfiguration.configDetails);

      if (validationErrors.length > 0) {
        for (let index = 0; index < 1; index++) {
          const element = validationErrors[index];
  
          this.toastType = typeToast.Error;
          this.messageToast = element;
          this.showToast = true;
           
        }

      } else {

        if (this.id) {

          this.bulkSettingsService.updateUBulkSettings(this.id,this.BulkConfiguration).subscribe({
            next: (data) => {
       
              this.toastType = typeToast.Success;
              this.messageToast = 'Registros actualizados exitosamente';
              this.showToast = true;
              setTimeout(() => {
                this.router.navigate(['/accounting/configuration/bulk-configuration']);
              }, 2000);
            },
            error: (err) => {
              console.error('Error al acutailizar configuracion:', err);
              this.toastType = typeToast.Error;
              this.messageToast = 'Error al acutailizar la configuracion';
              this.showToast = true;
            },
          });
          
        }else{
          this.bulkSettingsService.createUBulkSettings(this.BulkConfiguration).subscribe({
            next: (data) => {
       
              this.toastType = typeToast.Success;
              this.messageToast = 'Registros insertados exitosamente';
              this.showToast = true;
              setTimeout(() => {
                this.router.navigate(['/accounting/configuration/bulk-configuration']);
              }, 2000);
            },
            error: (err) => {
              console.error('Error creating transaction:', err);
              this.toastType = typeToast.Error;
              this.messageToast = 'Error al crear la transacción';
              this.showToast = true;
            },
          });
        }

        
      }
      
    }

   

  }

  onChangeJournal(e: any) {

    if (e.target.value == 1) {
      this.BulkConfiguration.configDetails = this.configDefaultSales;
    } else {
      this.BulkConfiguration.configDetails = this.configDefaultBuys;
    }

    console.log(e.target.value);

  }

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };



  goBack() {
    window.history.back();
  }

  validateUniqueFields(config: any[]): string[] {
    const titleSet = new Set<string>();
    const fieldSet = new Set<string>();
    const accountSet = new Set<string>();
    const columSet = new Set<number>();
    const bulkTypeDataSet = new Set<any>();
  
    const errors: string[] = [];
  
    config.forEach((item: any) => {
      if (!item.title) {
        errors.push('El título es obligatorio. Por favor, asegúrese de que todos los títulos estén completos.');
      } else {
        if (titleSet.has(item.title)) {
          errors.push(`El título "${item.title}" ya existe en la lista. Por favor, asegúrese de que todos los títulos sean únicos.`);
        } else {
          titleSet.add(item.title);
        }
      }
  
      if (item.colum == null || item.colum == undefined) {
        errors.push('La columna es obligatoria. Por favor, asegúrese de que todos los valores de columna estén completos.');
      } else {
        if (columSet.has(item.colum)) {
          const colum = this.colums.find((colum: any) => colum.value == item.colum);
          errors.push(`La columna "${colum?.colum}" ya existe en la lista. Por favor, asegúrese de que todas las columnas sean únicas.`);
        } else {
          columSet.add(item.colum);
        }
      }
  
      if (!item.bulkTypeData) {
        errors.push('El Tipo de dato es obligatorio.');
      } 
      
  
      if (item.field != null || item.field != undefined) {
        if (fieldSet.has(item.field)) {

          const field = this.tableFields.find(field=> field.key== item.field);
          errors.push(`El campo "${field?.value}" ya existe en la lista. Por favor, asegúrese de que todos los campos sean únicos.`);
        } else {
          fieldSet.add(item.field);

          
        }
      }
      
      if (item.account !== null && item.account !== undefined) {
        if (accountSet.has(item.account)) {
          const account = this.accountList.find(account => account.id == item.account);
          errors.push(`La cuenta "${account?.description} ${account?.code}" ya existe en la lista. Por favor, asegúrese de que todas las cuentas sean únicas.`);
        } else {

          if (item.operation ==  null || item.operation == undefined) {
            errors.push('La operacion es obligatoria cuando existe cuenta.');
          }

          if (item.bulkTypeData !=  BulkDetailType.N) {
            errors.push('tipo de dato de cuenta debe ser numerico');
          }


          accountSet.add(item.account);
        }
      }else{
        if (item.field ==  null || item.field == undefined) {
          errors.push('El campo es obligatorio cuando no existe cuenta.');
        }
      }
    });
  
    return errors;
  }
  
}



