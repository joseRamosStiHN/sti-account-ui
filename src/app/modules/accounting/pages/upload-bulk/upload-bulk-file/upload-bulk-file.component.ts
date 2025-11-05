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
  styleUrls: ['./upload-bulk-file.component.css']
})
export class UploadBulkFileComponent {
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  isDragging = false;
  selectedFile: File | undefined;
  fileUploaded = false;

  BulkConfiguration: UploadBulkSettingsModel;
  accountList: AccountModel[] = [];

  bulkSettingList$: Observable<UploadBulkSettings[]> | undefined;
  TransactionUpload$: any = [];
  TransactionErrors$: any = [];
  newBulk: boolean = false;
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
    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => item.supportEntry && item.balances.length > 0)
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
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    this.selectedFile = file;
    this.fileUploaded = false;
    
    // Mostrar mensaje de archivo seleccionado
    this.toastType = typeToast.Success;
    this.messageToast = `Archivo seleccionado: ${file.name}`;
    this.showToast = true;
    
  }

  async onSubmit(e: NgForm) {
    if (e.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.bulkSettingsService.UploadBulkSettings(formData, e.form.value.type, 1).subscribe({
        next: (data) => {
          this.typeTransaction = data.typeTransaction;
          const merged = [...data.data, ...data.errors];
          const dataFilter: any = merged.flatMap(item => {
            return item.accounts.map((account: any) => {
              const { accounts, ...rest } = item;
              return { ...rest, ...account };
            });
          });

          this.TransactionUpload$ = dataFilter;
          this.TransactionErrors$ = this.extractTransactionErrors(merged);
          this.fileUploaded = true;

          // Mostrar mensaje de éxito
          this.toastType = typeToast.Success;
          this.messageToast = 'Archivo procesado correctamente.';
          this.showToast = true;
        },
        error: (err) => {
          console.error('Error al subir el archivo:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al procesar el archivo.';
          this.showToast = true;
        },
      });
    }
  }

  async saveTransactions() {
    // Verificar si hay errores antes de proceder
    if (this.TransactionErrors$.length > 0) {
      this.toastType = typeToast.Warning;
      this.messageToast = 'No se pueden subir las transacciones. Corrija los errores.';
      this.showToast = true;
      return;
    }

    let dialogo = await confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Confirmación'
    );

    if (!dialogo) {
      return;
    }

    const groupedById = this.TransactionUpload$.reduce((acc: Map<string, Daum[]>, item: Daum) => {
      if (!acc.has(item.reference)) {
        acc.set(item.reference, []);
      }
      acc.get(item.reference)!.push(item);
      return acc;
    }, new Map<string, Daum[]>());

    const transactionsToSave: TransactionUpload = {
      typeTransaction: this.typeTransaction,
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
        this.newBulk = true;

        if (this.TransactionErrors$.length === 0) {
          this.toastType = typeToast.Success;
          this.messageToast = 'Transacciones guardadas correctamente';
        } else {
          this.toastType = typeToast.Warning;
          this.messageToast = 'Transacciones guardadas con algunos errores';
        }
        this.showToast = true;
      },
      error: (err) => {
        console.error('Error al guardar transacciones:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al guardar las transacciones';
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

  resetAll() {
    this.TransactionUpload$ = [];
    this.TransactionErrors$ = [];
    this.newBulk = false;
    this.selectedFile = undefined;
    this.fileUploaded = false;
  }

}