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
import { AdjustmentDetailById, AdjustmentRequest, AdjustmentResponseById } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { ActivatedRoute, Router } from '@angular/router';



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
  numberPda: string,
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

  showDetailsAdjustment: boolean[] = [];

  status: string = "";

  id: string | null = null;
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
    numberPda: '',
    totalDebit: 0,
    totalCredit: 0,
    details: []
  }

  listAdjustmentByTransaction: any[] = [];

  dataTable: LocalData[] = [];
  journalForm!: JournalModel;

  // modal
  popupVisible = false;

  description: string = '';

  //
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly adjustemntService = inject(AdjusmentService);
  private readonly journalService = inject(JournalService);
  private readonly activeRouter = inject(ActivatedRoute);

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


  constructor() {
    this.initializeShowDetails();
  }



  ngOnInit() {


    this.transService.getAll().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {

        this.allowAddEntry = false;

        this.adjustemntService.getAdjustmentById(findId).subscribe({
          next: (data) => {
            this.selectRow.referenceNumber = data.invoiceNo;
            this.description = data.descriptionAdjustment;
            this.status = data.status;

            const transaccion = data.adjustmentDetails.map((item: any) => {
              return {
                accountId: item.accountId,
                amount: item.amount,
                id: item.id,
                movement: item.typicalBalance,
                accountName: item.accountName,
                debit: item.debit,
                credit: item.credit
              } as Transaction;
            })
            this.accountService.getAllAccount().subscribe({
              next: (data) => {
                this.accountList = data
                  .filter(item => item.supportEntry)
                  .map(item => ({
                    id: item.id,
                    description: item.name,
                    code: item.accountCode
                  } as AccountModel));
              }
            });

            this.dataSource = transaccion

            // setTimeout(() => {
            //   this.hideEditDeleteButtons("Haber");
            // }, 10000);



          }
        });
      }
    });



  }




  async saveRow(e: any): Promise<void> {

    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'C' && debit.length <= 1) {
      if (debit.length == 1) {
        debit.forEach((item) => {
          const sum = credit.reduce((total, currentItem) => total + currentItem.amount, 0);

          const roundedSum = parseFloat(sum.toFixed(2));

          item.amount = roundedSum;
        });

      } else {

        this.dataSource.push({
          id: this.journalForm?.id ?? 0,
          accountId: this.journalForm?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),
          movement: 'D',

        });
      }

    }

    if (e.data.movement == 'D' && credit.length <= 1) {

      if (credit.length == 1) {
        credit.forEach((item) => {
          const sum = debit.reduce((total, currentItem) => total + currentItem.amount, 0);

          // Redondear la suma a dos decimales para asegurar precisión
          const roundedSum = parseFloat(sum.toFixed(2));

          item.amount = roundedSum
        });

      } else {

        this.dataSource.push({
          id: this.journalForm?.id ?? 0,
          accountId: this.journalForm?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),
          movement: 'C',

        });
      }

    }


    this.updateAmounts();

  }

  removedRow(e:any): void {
    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'D' && credit.length == 1 && debit.length == 0) {
      this.dataSource = [];
      return;
    }
    if (e.data.movement == 'C' && debit.length == 1 && credit.length == 0) {
      this.dataSource = [];
      return
    }

    if (e.data.movement == 'D' && credit.length == 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, item) => sum + item.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }
    if (e.data.movement == 'C' && debit.length == 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, item) => sum + item.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }

    this.updateAmounts();

  }


  updateRow(e: any): void {

    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'D' && credit.length == 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }
    if (e.data.movement == 'C' && debit.length == 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }


    this.updateAmounts();
  }


  private updateAmounts(): void {

   
    if (this.dataSource.length > 0) {

      const debe = this.dataSource
        .filter((data) => data.movement === 'D')
        .reduce((sum, item) => sum + item.amount, 0);
    
      const haber = this.dataSource
        .filter((data) => data.movement === 'C')
        .reduce((sum, item) => sum + item.amount, 0);
    

      this.totalCredit = parseFloat(haber.toFixed(2));
      this.totalDebit = parseFloat(debe.toFixed(2));
    

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
              accountName: item.accountName
            } as Transaction;
          })
        } as LocalData;


      })


  }

  showDetails: boolean = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  async onSubmit(e: NgForm) {

    if (e.valid && this.selectRow.referenceNumber != '' && this.validate()) {

      const request: AdjustmentRequest = {

        transactionId: this.selectRow.id,
        reference: "Ajuste",
        descriptionAdjustment: e.form.value.description,
        detailAdjustment: this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement

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

          setTimeout(() => {
            this.router.navigate(['/accounting/adjustment-list']);    
          }, 3000);

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
      numberPda: transaccion.numberPda,
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

    this.getAllAdjustmentByTransaction(copiaTransaccion.id);

    copiaTransaccion.details?.forEach((detail) => {
      if (detail.movement === "D" || detail.movement === "C") {
        const isDebit = detail.movement === "D";
        detail.movement = isDebit ? "C" : "D";
      }
    });

    this.dataSource = copiaTransaccion.details!;

    this.selectRow = transaccion;
    this.handleDocumentType(transaccion.documentType);

    this.updateAmounts();
  }


  private handleDocumentType(documentType: number | undefined): void {
    if (documentType === JournalTypes.Ventas || documentType === JournalTypes.Compras) {
      const accountType = documentType === JournalTypes.Ventas ? JournalTypes.Ventas : JournalTypes.Compras;
      this.accountService.getAllAccount().subscribe({
        next: (data) => {
          this.accountList = data
            .filter(item => item.supportEntry)
            .map(item => ({
              id: item.id,
              description: item.name,
              code: item.accountCode
            } as AccountModel));
        }
      });
      const accountToCheck = documentType === JournalTypes.Ventas ? 'Debe' : 'Haber';

    }
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        const transId = Number(this.id);
        this.adjustemntService.putStatusAdjusment(transId).subscribe({
          next: (data) => {
            this.router.navigate(['/accounting/adjustment-list']);
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar publicar la transacción';
            this.showToast = true;

          },
        });
      }
    });
  }


  getAllAdjustmentByTransaction(id: number) {
    this.adjustemntService.getAllAdjustmentByTrasactionId(id).subscribe({
      next: (data) => {
        this.listAdjustmentByTransaction = data.map((transaction: any) => (

          {
            numberPda: transaction.descriptionAdjustment,
            totalDebit: transaction.adjustmentDetails?.filter((item: any) => item.shortEntryType === "D")
              .reduce((total: any, item: any) => total + item.amount, 0),
            totalCredit: transaction.adjustmentDetails?.filter((item: any) => item.shortEntryType === "C")
              .reduce((total: any, item: any) => total + item.amount, 0),
            date: transaction.creationDate.substring(0, 10),
            user: transaction.user,
            details: transaction.adjustmentDetails?.map((item: any) => ({
              id: item.id,
              nameAccount: item.accountName,
              debe: item.shortEntryType === 'D' ? item.amount : 0,
              haber: item.shortEntryType === 'C' ? item.amount : 0,
            })) as DetailsPda[]
          })) as TransactionPda[];

      }
    });
  }

  initializeShowDetails() {
    this.showDetailsAdjustment = this.listAdjustmentByTransaction.map(() => false);
  }

  toggleDetailsAdjustment(index: number) {
    this.showDetailsAdjustment[index] = !this.showDetailsAdjustment[index];
  }

  trackByFn(index: number, item: any) {
    return item.numberPda;  // Asumiendo que numberPda es único
  }


  getCredit(dataRow: any) {

    if (dataRow.movement === "C") {
      return dataRow.amount;
    }

    return 0;

  }
  getDebit(dataRow: any) {
    if (dataRow.movement === "D") {
      return dataRow.amount;
    }

    return 0;

  }

}
