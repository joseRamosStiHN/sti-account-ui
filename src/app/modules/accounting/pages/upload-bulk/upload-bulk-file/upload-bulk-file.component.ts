import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastType } from 'devextreme/ui/toast';
import { Observable } from 'rxjs';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { Account, Daum, TransactionUpload, UploadBulkSettings } from 'src/app/modules/accounting/models/APIModels';
import { typeToast, UploadBulkSettingsModel } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { UploadBulkService } from 'src/app/modules/accounting/services/upload-bulk.service';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-upload-bulk-file',
  templateUrl: './upload-bulk-file.component.html',
  styleUrl: './upload-bulk-file.component.css'
})
export class UploadBulkFileComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  isDragging = false;
  selectedFile: File | undefined;

  BulkConfiguration: UploadBulkSettingsModel;
  accountList: AccountModel[] = [];

  bulkSettingList$: Observable<UploadBulkSettings[]> | undefined;
  TransactionUpload$: any = [];
  TransactionErrors$: any = [];
  newBulk:boolean = false;

  typeTransaction: number = 0;

  private readonly accountService = inject(AccountService);
  private readonly bulkSettingsService = inject(UploadBulkService);
  constructor() {
    this.BulkConfiguration = {
      name: "",
      type: null,
      rowInit: null,
      configDetails: []
    };
  }

  ngOnInit(): void {
    this.bulkSettingList$ = this.bulkSettingsService.getAllBulkSettings();
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

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }

  async onSubmit(e: NgForm) {

    if (e.valid && this.selectedFile) {

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.bulkSettingsService.UploadBulkSettings(formData, e.form.value.type, 1).subscribe({
        next: (data) => {
          this.typeTransaction = data.typetransaction;
          const merged = [...data.data, ...data.errors];
          const dataFilter: any = merged.flatMap(item => {
            return item.accounts.map((account: any) => {
              const { accounts, ...rest } = item;
              return { ...rest, ...account };
            });
          });

          this.TransactionUpload$ = dataFilter;

          this.TransactionErrors$ = this.extractTransactionErrors(merged);
        

        },
        error: (err) => {
          console.error('Error al subir el archivo:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al subir el archivo';
          this.showToast = true;
        },
      });

    }

  }

  async saveTransactions() {


    let dialogo = await confirm(
      `¿Está seguro de que desea realizar esta acción, revise los errores de las partidas?`,
      'Advertencia'
    );


    const groupedById = this.TransactionUpload$.reduce((acc: Map<string, Daum[]>, item: Daum) => {
      if (!acc.has(item.id)) {
        acc.set(item.id, []);
      }
      acc.get(item.id)!.push(item);
      return acc;
    }, new Map<string, Daum[]>());

    const transactionsToSave: TransactionUpload = {
      typetransaction: this.typeTransaction,
      data: [],
      errors: [],
    };

    for (const values of groupedById.values()) {
      const listAccount: Account[] = [];

      for (const transaction of values) {
        const account: Account = {
          title: transaction.title,
          account: transaction.account,
          credit: transaction.credit,
          debit: transaction.debit,
        };

        listAccount.push(account);
      }

      const transactionData: Daum = {
        id: values[0].id,
        row: values[0].row,
        date: values[0].date,
        currency: values[0].currency,
        description: values[0].description,
        errors: values[0].errors,
        reference: values[0].reference,
        status: values[0].status,
        exchangeRate: values[0].exchangeRate,
        typeSale: values[0].typeSale,
        cashValue: values[0].cashValue,
        creditValue: values[0].creditValue,
        typePayment: values[0].typePayment,
        rtn: values[0].rtn,
        supplierName: values[0].supplierName,
        accounts: listAccount,
        otherFields: values[0].otherFields,
      };

      if (transactionData.errors == null || transactionData.errors == '') {
        transactionsToSave.errors.push(transactionData);
      } else {
        transactionsToSave.data.push(transactionData);
      }
    }

    this.bulkSettingsService.saveTransacionsBulk(transactionsToSave).subscribe({
      next: (data) => {

        const merged = [...data.data, ...data.errors];
        this.TransactionErrors$ = this.extractTransactionErrors(merged);
        this.newBulk = true

      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al subir el archivo';
        this.showToast = true;
      },
    });



  }

  private extractTransactionErrors(merged: any[]): any[] {
    return merged
      .filter((data: any) => data.errors != null && data.errors.length > 0)
      .flatMap((data: any) =>
        data.errors.split(',').map((mensaje: string) => ({
          row: data.row,
          mensaje,
        }))
      );
  }

   resetAll(){
    this.TransactionUpload$ = [];
    this.TransactionErrors$ = [];
    this.newBulk = false;
    this.selectedFile = undefined;
  }
  





}
