import { Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { IMovement, Transaction, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { NgForm } from '@angular/forms';
import { AdjustmentRequest } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';



interface LocalData {
  id: number;
  referenceNumber?: string; // este es el numero de factura de cliente o proveedor o banco etc,
  reference?: string;
  journalEntry?: string;
  journalEntryId?: number;
  total?: number;
  status?: string;
  date?: Date;
  numberPda?: string
  documentType?: number
  diaryType?: number
  details?: Transaction[]
}

interface TransactionPda {
  numberPda: number,
  totalDebit: number,
  totalCredit: number,
  details: DetailsPda[]
}

export interface DetailsPda {
  id: number;
  nameAccount: string;
  debe: number;
  haber: number;
}

@Component({
  selector: 'app-accounting-adjustment',
  templateUrl: './accounting-adjustment.component.html',
  styleUrl: './accounting-adjustment.component.css'
})
export class AccountingAdjustmentComponent {

  totalCredit: number = 0;
  totalDebit: number = 0;
  allowAddEntry: boolean = true;

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

  documentType!: number;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  accountList: AccountModel[] = [];
  dataSource: Transaction[] = [];
  transactionOriginal: TransactionPda = {
    numberPda: 0,
    totalDebit: 0,
    totalCredit: 0,
    details: []
  }

  dataTable: LocalData[] = [];
  journalForm!: JournalModel;

  // modal
  popupVisible = false;

  description: string = '';

  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly adjustemntService = inject(AdjusmentService);
  private readonly journalService = inject(JournalService);

  selectRow: LocalData = {
    id: 0,
    referenceNumber: ""
  }


  editorOptions = {
    itemTemplate: 'accounts',
    searchEnabled: true,
    searchMode: 'contains',
    searchExpr: ['description', 'code'],
    onOpened: (e: any) => {
      const popupElement = e.component._popup.$content();
      const listItems = popupElement.find('.dx-list-item');

      listItems.each((index: number, item: any) => {
        const codeAccount = item.textContent.split(' ')[0];
        const shouldHideItem = codeAccount === this.journalForm?.defaultAccountCode;
        item.style.display = shouldHideItem ? 'none' : 'block';
        if (shouldHideItem) {
          popupElement[0].style.height = 'auto';
        }
      });
    }
  };



  ngOnInit() {

    this.transService.getAll().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });


  }

  async saveRow(event: any): Promise<void> {
    if (this.documentType === JournalTypes.Ventas) {


      this.updateAmounts();
    } else {

      this.updateAmounts();
    }
  }

  removedRow(): void {
    if (this.documentType === JournalTypes.Ventas) {
      this.updateAmounts();
    } else {
      this.updateAmounts();
    }
  }


  updateRow(): void {
    if (this.documentType === JournalTypes.Ventas) {
      this.updateAmounts();
    } else {
      this.updateAmounts();
    }
  }


  private updateAmounts(): void {

    if (this.dataSource.length > 0) {
      const sumDebit = this.dataSource
        .reduce((total, item) => {
          return total + (item.debit ?? 0);
        }, 0);

      const sumCredit = this.dataSource
        .reduce((total, item) => {
          return total + (item.credit ?? 0);
        }, 0);

      console.log(this.dataSource);


      console.log(sumDebit);


      this.totalCredit = sumCredit;
      this.totalDebit = sumDebit;

      // foundItems.forEach(item => {
      //   item.amount = sumDebit;
      // });
    }
  }



  // calcula el total en el componente del summary
  calculateSummary(options: any) {
    if (options.name === 'totalDebit' || options.name === 'totalCredit') {
      switch (options.summaryProcess) {
        case 'start':
          options.totalValue = 0;
          break;
        case 'calculate':
          if (options.name === 'totalDebit' && options.value.movement === 'D') {
            // si es el item de debito y el movimiento el `DEBE`
            options.totalValue += options.value.amount;
          }
          if (
            options.name === 'totalCredit' &&
            options.value.movement === 'C'
          ) {
            // si es el item de credito y movimiento es el `HABER`
            options.totalValue += options.value.amount;
          }
          break;
      }
    }
  }

  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false); // elimina el loading cuando agregas una nueva fila
    const gridComponent = e.component;

    // Obtén los totales del summary. por medio de los nombres del calculateSummary.
    const totalDebit = gridComponent.getTotalSummaryValue('totalDebit');
    const totalCredit = gridComponent.getTotalSummaryValue('totalCredit');

    // Aquí se maneja los totales obtenidos, como actualizar propiedades del componente o llamar a métodos.
    // console.log(`Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
    // this.totalDebit = totalDebit; // actualiza en la vista
    // this.totalCredit = totalCredit;



  }

  private validate(): boolean {
    this.messageToast = ''; // limpia el balance
    this.showToast = false;
    if (this.dataSource.length < 2) {
      // si el array contiene menos de 2 registros
      this.messageToast = 'Debe agregar al menos 2 transacciones';
      this.showToast = true;
      this.toastType = typeToast.Error;
      //console.log('invalida number of tnx');
      return false;
    }
    // operar sobre el total y verificar que lleve a cero la operación
    const total = this.totalCredit - this.totalDebit;
    if (total !== 0) {
      this.messageToast =
        'El balance no es correcto, por favor ingrese los valores correctos';
      this.showToast = true;
      this.toastType = typeToast.Error;
      //console.log('invalida balance');
      return false;
    }
    // si todo `OK` retorna true

    const hasDuplicateAccountId = this.dataSource.some((item, index) => {
      return this.dataSource.filter(obj => obj.accountId === item.accountId).length > 1;
    });

    if (hasDuplicateAccountId) {
      this.messageToast =
        'No se puede registrar la misma cuenta en la transaccion';
      this.showToast = true;
      this.toastType = typeToast.Error;

      return false;
    }

    return true;
  }

  fillDataSource(data: any[]): LocalData[] {


    return data.filter((item: any) => item.status == "SUCCESS")
      .map((item: any) => {
        const totalDetail = item.transactionDetails.find((element: any) => {
          if (item.documentType === JournalTypes.Ventas && element.entryType === "Credito") {
            return true;
          } else if (item.documentType === JournalTypes.Compras && element.entryType === "Debito") {
            return true;
          }
          return false;
        });

        return {
          id: item.id,
          date: item.date,
          referenceNumber: item.reference,
          documentType: item.documentType,
          numberPda: item.numberPda,
          diaryType: item.diaryType,
          reference: item.documentType == JournalTypes.Ventas || item.documentType == JournalTypes.Compras
            ? "" : item.description,
          journalEntry: item.documentType == JournalTypes.Ventas ? "Ventas" : "Compras",
          total: totalDetail.amount,
          status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
          details: item.transactionDetails.map((item: any) => {
            return {
              accountId: item.accountId,
              amount: item.amount,
              id: item.id,
              movement: item.shortEntryType == "C" ? "C" : "D",
              accountName: item.accountName,
              debit: item.shortEntryType === "D" ? item.amount : 0,
              credit: item.shortEntryType == "C" ? item.amount : 0
            } as Transaction;
          })
        } as LocalData;


      })


  }

  async onSubmit(e: NgForm) {

    if (this.selectRow.referenceNumber != '' && this.validate()) {

      const request: AdjustmentRequest = {

        transactionId: this.selectRow.id,
        reference: "Ajuste",
        descriptionAdjustment: e.form.value.description,
        detailAdjustment: this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            debit: detail.debit ?? 0,
            credit: detail.credit ?? 0
          };
        }),
      };

      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );

      if (!dialogo) {
        return;
      }




      this.adjustemntService.createAdjusment(request).subscribe({
        next: (data) => {
          // this.fillBilling(data);
          this.toastType = typeToast.Success;
          this.messageToast = 'Registros insertados exitosamente';
          this.showToast = true;
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

  showModal() {
    this.popupVisible = this.popupVisible ? false : true;
  }


  customCurrencyText(cellInfo: any): string {
    return cellInfo.valueText.replace('USD', '$').replace('HNL', 'L');
  }

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };

  goBack() {
    window.history.back();
  }

  onRowSelected(event: any): void {
    const reference = event.selectedRowsData[0];
    if (reference && reference.referenceNumber) {


      this.handleTransaction(reference.referenceNumber);
    }
  }


  onValueChange(reference: string): void {
    if (reference) {
      this.handleTransaction(reference);
    }
  }


  private handleTransaction(referenceNumber: string): void {
    const transaccionEncontrada = this.dataTable.find(data => data.referenceNumber === referenceNumber);

    const transaccion: LocalData = transaccionEncontrada
      ? { ...transaccionEncontrada }
      : { id: 0, referenceNumber: '' };

    if (!transaccion) return;
    this.documentType = transaccion.documentType!;

    this.journalService.getJournalById(transaccion.diaryType!).subscribe(data => {
      this.journalForm = data;
    });



    this.transactionOriginal = {
      numberPda: transaccion.numberPda ? parseInt(transaccion.numberPda, 10) : 0,
      totalDebit: transaccion.details?.filter(data => data.movement === "D")
        .reduce((total, item) => total + item.amount, 0),
      totalCredit: transaccion.details?.filter(data => data.movement === "C")
        .reduce((total, item) => total + item.amount, 0),
      details: transaccion.details?.map(item => ({
        id: item.id,
        nameAccount: item.accountName,
        debe: item.movement == 'D' ? item.amount : 0,
        haber: item.movement == 'C' ? item.amount : 0,
      })) as DetailsPda[]
    } as TransactionPda;

    const copiaTransaccion = { ...transaccion };

    copiaTransaccion.details?.forEach((detail) => {
      if (detail.movement === "D" || detail.movement === "C") {
        const isDebit = detail.movement === "D";
        detail.movement = isDebit ? "C" : "D";
        [detail.debit, detail.credit] = isDebit ? [0, detail.debit] : [detail.credit, 0];
      }
    });
    
    this.dataSource = copiaTransaccion.details!;

    this.selectRow = transaccion;


    this.handleDocumentType(transaccion.documentType);
  }


  private handleDocumentType(documentType: number | undefined): void {
    if (documentType === JournalTypes.Ventas || documentType === JournalTypes.Compras) {
      const accountType = documentType === JournalTypes.Ventas ? JournalTypes.Ventas : JournalTypes.Compras;
      this.accountService.getAllAccount().subscribe({
        next: (data) => {
          this.accountList = data
            .filter(item => item.supportEntry && item.balances.length > 0 && item.accountType === accountType)
            .map(item => ({
              id: item.id,
              description: item.name,
              code: item.accountCode
            } as AccountModel));
        }
      });
      const accountToCheck = documentType === JournalTypes.Ventas ? 'Debe' : 'Haber';
      setTimeout(() => this.hideEditDeleteButtons(accountToCheck), 100);
    }
  }

  private hideEditDeleteButtons(accountToCheck: string): void {
    const rows = document.querySelectorAll('.dx-data-row');
    rows.forEach(row => {
      const tds = row.querySelectorAll("td");
      tds.forEach(td => {
        const codeAccount = td.textContent;
        if (codeAccount === accountToCheck) {
          const editButtons = row.querySelectorAll(".dx-link-edit");
          const deleteButtons = row.querySelectorAll(".dx-link-delete");

          editButtons.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });

          deleteButtons.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
        }
      });
    });
  }

}
