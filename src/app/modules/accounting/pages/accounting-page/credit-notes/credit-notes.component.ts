
import { Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import {  IMovement, Notes, Transaction, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { NgForm } from '@angular/forms';
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
  selector: 'app-credit-notes',
  templateUrl: './credit-notes.component.html',
  styleUrl: './credit-notes.component.css'
})
export class CreditNotesComponent {

  creditNotes: Notes = {
    reference: 0,
    date: new Date(),
    dayri: 0,
    applyPorcent: 'no',
    percent: 0,
    description: '',
  };
  listCredtiNotesByTransaction:any[]=[];

  journalList: JournalModel[] = [];

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

  creditTransaction: LocalData[] = [];
  journalForm?: JournalModel;

  // modal
  popupVisible = false;
  id: string | null = null;

  description: string = '';
  status:string="";

  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly journalService = inject(JournalService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);

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


  }



  ngOnInit() {

    this.transService.getAll().subscribe({
      next: (data) => {
        this.creditTransaction = this.fillDataSource(data);
      },
    });

    this.journalService.getAllAccountingJournal().subscribe({
      next: (data) => {
        this.journalList = data
          .filter(item => item.accountType == JournalTypes.Ventas && item.status);
      },
    })

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');   
      const findId = Number(this.id);
      if (findId) {

        this.allowAddEntry= false;
        
        this.transService.getNoteCreditById(findId).subscribe({
          next: (data) => {
          
            this.selectRow.referenceNumber= data.invoiceNo;
            this.description = data.descriptionNote;
            this.creditNotes.date = data.date;
            this.creditNotes.dayri = data.diaryType;

            this.status = data.status;
    
            const transaccion =  data.detailNote.map((item: any) => {
              return {
                accountId: item.accountId,
                amount: item.amount,
                id: item.id,
                movement: item.shortEntryType,
                accountName: item.accountName,
                debit:  item.debit,
                credit: item.credit
              } as Transaction;
            })
            this.accountService.getAllAccount().subscribe({
              next: (data) => {
                this.accountList = data
                  .filter(item => item.supportEntry )
                  .map(item => ({
                    id: item.id,
                    description: item.name,
                    code: item.accountCode
                  } as AccountModel));
              }
            });
             this.dataSource = transaccion;
             this.updateAmounts();
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
          id:  this.journalForm?.id ?? 0,
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
      // Calcular el total de los movimientos 'D' (debe)
      const debe = this.dataSource
        .filter((data) => data.movement === 'D')
        .reduce((sum, item) => sum + item.amount, 0);
    
      // Calcular el total de los movimientos 'C' (haber)
      const haber = this.dataSource
        .filter((data) => data.movement === 'C')
        .reduce((sum, item) => sum + item.amount, 0);
    
      // Redondear los totales a dos decimales
      this.totalCredit = parseFloat(haber.toFixed(2));
      this.totalDebit = parseFloat(debe.toFixed(2));
    
      // Mostrar en la consola para verificar
      // console.log('Total Debit:', this.totalDebit);
      // console.log('Total Credit:', this.totalCredit);
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


    return data.filter((item: any) => item.status == "SUCCESS" && item.documentType === JournalTypes.Ventas)
      .map((item: any) => {

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
          total: item.amount,
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

    if (this.selectRow.referenceNumber != '' && this.validate() && e.valid) {



      const request: any = {

        transactionId: this.selectRow.id,
        reference: "Nota Credito",
        descriptionNote: e.form.value.description,
        diaryType: e.form.value.dayri,
        createAtDate: e.form.value.date,
        detailNote: this.dataSource.map((detail) => {
          return {
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

      this.transService.createTransactionCreditNotes(request).subscribe({
        next: (data) => {

          this.toastType = typeToast.Success;
          this.messageToast = 'Registros insertados exitosamente';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/creditnotes-list']);
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

  onChangeJournal(e: any) {

    if (e.target.value) {
      this.handleDocumentType(this.selectRow);
    }
  }

  onChangePercent(e: any) {

    this.handleDocumentType(this.selectRow);

  }


  private handleTransaction(referenceNumber: string): void {

    const transaccionEncontrada = this.creditTransaction.find(data => data.referenceNumber === referenceNumber);

    const transaccion: LocalData = transaccionEncontrada
      ? { ...transaccionEncontrada }
      : { id: 0, referenceNumber: '' };

    if (!transaccion) return;
    this.documentType = transaccion.documentType!;

    const copiaTransaction = { ...transaccion };

    this.transactionOriginal = {
      numberPda: copiaTransaction.numberPda ? parseInt(copiaTransaction.numberPda, 10) : 0,
      totalDebit: copiaTransaction.details?.filter(data => data.movement === "D")
        .reduce((total, item) => total + item.amount, 0),
      totalCredit: copiaTransaction.details?.filter(data => data.movement === "C")
        .reduce((total, item) => total + item.amount, 0),
      details: copiaTransaction.details?.map(item => ({
        id: item.id,
        nameAccount: item.accountName,
        debe: item.movement == 'D' ? item.amount : 0,
        haber: item.movement == 'C' ? item.amount : 0,
      })) as DetailsPda[]
    } as TransactionPda;

    this.getAllCreditByTransaction(transaccion.id);


    this.selectRow = transaccion;

    this.handleDocumentType(transaccion);

  }


  private handleDocumentType(transaccion: LocalData): void {


    if (this.creditNotes.dayri != 0 && transaccion.documentType != null) {
      this.journalForm = this.journalList.find((item) => item.id == this.creditNotes.dayri);


      this.accountService.getAllAccount().subscribe({
        next: (data) => {
          this.accountList = data
            .filter(item => item.supportEntry 
              || item.id == this.journalForm?.defaultAccount
            )
            .map(item => ({
              id: item.id,
              description: item.name,
              code: item.accountCode
            } as AccountModel));
        }
      });

      let JournalDefault: JournalModel;

      this.journalService.getJournalById(transaccion.diaryType!).subscribe(data => {
        JournalDefault = data;

        const itemToRemove = transaccion.details?.find(item => item.accountId === JournalDefault.defaultAccount);

        if (itemToRemove) {
          const index = transaccion.details?.indexOf(itemToRemove);

          if (index !== undefined && index >= 0) {
            transaccion.details?.splice(index, 1);
          }
        }

        const accountToCheck = "Debe";

        transaccion.details?.forEach(details => details.movement = "C")

        transaccion.details?.push({
          "id": 0,
          "accountId": this.journalForm?.defaultAccount ?? 0,
          "amount": itemToRemove?.amount ?? 0,
          "movement": "D",
          "accountName": this.journalForm?.defaultAccountName ?? ''
        });

  

        this.dataSource = transaccion?.details ?? [];
        // setTimeout(() => this.hideEditDeleteButtons(accountToCheck), 100);

        this.updateAmounts();


      });

    }


  }

  // private hideEditDeleteButtons(accountToCheck: string): void {
  //   const rows = document.querySelectorAll('.dx-data-row');
  //   rows.forEach(row => {
  //     const tds = row.querySelectorAll("td");
  //     tds.forEach(td => {
  //       const codeAccount = td.textContent;
  //       if (codeAccount === accountToCheck) {
  //         const editButtons = row.querySelectorAll(".dx-link-edit");
  //         const deleteButtons = row.querySelectorAll(".dx-link-delete");

  //         editButtons.forEach(button => {
  //           (button as HTMLElement).style.display = 'none';
  //         });

  //         deleteButtons.forEach(button => {
  //           (button as HTMLElement).style.display = 'none';
  //         });
  //       }
  //     });
  //   });
  // }

  showDetails: boolean = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }


  getAllCreditByTransaction(id:number){
    this.transService.getAllCreditNoteByTrasactionId(id).subscribe({
      next: (data:any) => {
        this.listCredtiNotesByTransaction = data.map((transaction:any) => (
          {
          numberPda: transaction.descriptionNote ,
          totalDebit: transaction.detailNote?.filter((item:any) => item.shortEntryType === "D")
            .reduce((total:any, item:any) => total + item.amount, 0),
          totalCredit: transaction.detailNote?.filter((item:any) => item.shortEntryType === "C")
            .reduce((total:any, item:any) => total + item.amount, 0),
          date:transaction.date,
          user:transaction.user,
          details: transaction.detailNote?.map((item:any) => ({
            id: item.id,
            nameAccount: item.accountName,
            debe: item.shortEntryType === 'D' ? item.amount : 0,
            haber: item.shortEntryType === 'C' ? item.amount : 0,
          })) as DetailsPda[]
        })) as any [];
    
      }
    });
  }

  showDetailsAdjustment: boolean[] = [];
  initializeShowDetails() {
    this.showDetailsAdjustment = this.listCredtiNotesByTransaction.map(() => false);
  }

  toggleDetailsAdjustment(index: number) {
    this.showDetailsAdjustment[index] = !this.showDetailsAdjustment[index];
  }

  trackByFn(index: number, item: any) {
    return item.numberPda;  // Asumiendo que numberPda es único
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        const transId = Number(this.id);
        this.transService.putStatusCreditNotes(transId).subscribe({
          next: (data) => {
            setTimeout(() => {
              this.router.navigate(['/accounting/creditnotes-list']);
            }, 2000);
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

