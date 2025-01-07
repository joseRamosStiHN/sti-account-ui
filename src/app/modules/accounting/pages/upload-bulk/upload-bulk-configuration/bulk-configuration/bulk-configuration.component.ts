import { Component, inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { BulkDetailType, ClientBilling, ConfigDetailModel, IMovement, typeToast, UploadBulkSettingsModel } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { UploadBulkService } from 'src/app/modules/accounting/services/upload-bulk.service';

@Component({
  selector: 'app-bulk-configuration',
  templateUrl: './bulk-configuration.component.html',
  styleUrl: './bulk-configuration.component.css'
})
export class BulkConfigurationComponent {

  BulkConfiguration: UploadBulkSettingsModel;
  // configDetailModel:ConfigDetailModel;
  colums: any = [
    { colum: "A", value: 0, status: false },
    { colum: "B", value: 1, status: false },
    { colum: "C", value: 2, status: false },
    { colum: "D", value: 3, status: false },
    { colum: "E", value: 4, status: false },
    { colum: "F", value: 5, status: false },
    { colum: "G", value: 6, status: false },
    { colum: "H", value: 7, status: false },
    { colum: "I", value: 8, status: false },
    { colum: "J", value: 9, status: false },
    { colum: "K", value: 10, status: false },
    { colum: "L", value: 11, status: false },
    { colum: "M", value: 12, status: false },
    { colum: "N", value: 13, status: false },
    { colum: "O", value: 14, status: false },
    { colum: "P", value: 15, status: false },
    { colum: "Q", value: 16, status: false },
    { colum: "R", value: 17, status: false },
    { colum: "S", value: 18, status: false },
    { colum: "T", value: 19, status: false }
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


  configDefault: any = [
    {
      colum: null,
      title: "VALOR-CREDITO",
      bulkTypeData: BulkDetailType.ACC,
      account: null,
      operation: null,

    },
    {
      colum: null,
      title: "VALOR-CONTADO",
      bulkTypeData: BulkDetailType.ACC,
      account: null,
      operation: null,

    },

    {
      colum: null,
      title: "FACTURA",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,

    },
    {
      colum: null,
      title: "FECHA",
      bulkTypeData: BulkDetailType.DT,
      account: null,
      operation: null,

    },
    {
      colum: null,
      title: "DETALLE",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,

    },
    {
      colum: null,
      title: "CON-RTN",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,
    },
    {
      colum: null,
      title: "TIPO-PAGO",
      bulkTypeData: BulkDetailType.S,
      account: null,
      operation: null,

    },


  ]

  editorOptions = {
    onValueChanged: (event: any) => {
      const selectedValue = event.value;
    },
    showClearButton: true
    , setCellValue: (rowData: any, value: any) => {
      rowData.colum = value; 

    }
  };

  @Input('id') id?: number;

  accountList: AccountModel[] = [];
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  journalList: any;

  private readonly accountService = inject(AccountService);
  private readonly bulkSettingsService = inject(UploadBulkService);
  private readonly router = inject(Router);
  private readonly journalService = inject(JournalService);


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
      this.bulkSettingsService.getBulkConfigurationById(this.id).subscribe(data => {
        this.configDefault = data.configDetails.slice(0, 7);

        this.BulkConfiguration = {
          ...data,
          configDetails: data.configDetails.slice(7)
        };
      }

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

    this.journalService.getAllAccountingJournal().subscribe({
      next: (data) => {
        this.journalList = data;
      },
    });

  }


  async onSubmit(e: NgForm) {

    if (e.valid) {
      this.BulkConfiguration.configDetails.forEach((data) => {
        if (data.account != null || data.account != undefined) {
          data.bulkTypeData = BulkDetailType.ACC
        } else {
          data.bulkTypeData = BulkDetailType.S
        }

      })

      const request: UploadBulkSettingsModel = {
        name: this.BulkConfiguration.name,
        type: this.BulkConfiguration.type,
        rowInit: this.BulkConfiguration.rowInit,
        configDetails: [...this.configDefault, ...this.BulkConfiguration.configDetails]
      };


      const validationErrors = this.validateUniqueFields(request.configDetails);

      if (validationErrors.length > 0) {
        for (let index = 0; index < 1; index++) {
          const element = validationErrors[index];

          this.toastType = typeToast.Error;
          this.messageToast = element;
          this.showToast = true;

        }

      } else {

        if (this.id) {
          this.bulkSettingsService.updateUBulkSettings(this.id, request).subscribe({
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

        } else {
          this.bulkSettingsService.createUBulkSettings(request).subscribe({
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

  async onChange(e: any) {
    this.colums.forEach((colum: any) => {
      if (colum.value === e) {
        colum.status = true;
      }
    });

    const configDetails = await [...this.configDefault, ...this.BulkConfiguration.configDetails];

    const columnFilter = this.colums.filter((column: any) => {
      return configDetails.some((config: any) => column.value === config.colum);
    });

    this.colums.forEach((columna: any) => {
      const encontrado = columnFilter.find((x: any) => x.value === columna.value);
      if (!encontrado) {
        columna.status = false;
      }
    });
  }


  onChangeTable(e: any) {
    const selectedValue = e.value;

    this.colums.forEach((colum: any) => {
      if (colum.value === selectedValue) {
        colum.status = true;
      }
    });

    const configDetails = [...this.configDefault, ...this.BulkConfiguration.configDetails];

    const columnFilter = this.colums.filter((column: any) => {
      return configDetails.some((config: any) => column.value === config.colum);
    });

    this.colums.forEach((columna: any) => {
      const encontrado = columnFilter.find((x: any) => x.value === columna.value);
      if (!encontrado) {
        columna.status = false;
      }
    });
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



      if (item.account !== null && item.account !== undefined) {
        if (accountSet.has(item.account)) {
          const account = this.accountList.find(account => account.id == item.account);
          errors.push(`La cuenta "${account?.description} ${account?.code}" ya existe en la lista. Por favor, asegúrese de que todas las cuentas sean únicas.`);
        } else {

          if (item.operation == null || item.operation == undefined) {
            errors.push('La operacion es obligatoria cuando existe cuenta.');
          }


          accountSet.add(item.account);
        }
      }

    });

    return errors;
  }


  get filteredColumns() {
    return this.colums.filter((colum: any) => !colum.status);
  }


 

}



