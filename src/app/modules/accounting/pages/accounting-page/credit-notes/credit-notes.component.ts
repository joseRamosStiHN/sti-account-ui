
import { Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { ClientBilling, CreditNotes, IMovement, Transaction, typeToast } from 'src/app/modules/accounting/models/models';
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
  selector: 'app-credit-notes',
  templateUrl: './credit-notes.component.html',
  styleUrl: './credit-notes.component.css'
})
export class CreditNotesComponent {

  creditNotes: CreditNotes = {
    reference: 0,
    date: new Date(),
    dayri: 0,
    applyPorcent: 'no',
    percent: 0,
    description: '',
  };

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
          .filter(item => item.accountType == JournalTypes.Varios && item.status);
      },
    })


  }

  async saveRow(e: any): Promise<void> {

    e.data.movement = "C";
    let foundItems = this.dataSource.filter((data) => data.movement === 'D');
    if (foundItems.length > 0) {

      foundItems.forEach((item) => {
        const sum = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);

        this.totalCredit = sum;
        this.totalDebit = sum;
        item.amount = sum
      });
    }

    this.updateAmounts();
  }


  removedRow(): void {

    this.updateAmounts();

  }


  updateRow(e: any): void {

    let foundItems = this.dataSource.filter((data) => data.movement === 'D');
    if (foundItems.length > 0) {
      foundItems.forEach((item) => {
        const sum = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);
        this.totalCredit = sum;
        this.totalDebit = sum;
        item.amount = sum
      });
    }

    this.updateAmounts();
    
  }


  private updateAmounts(): void {
    if (this.dataSource.length === 0) return;


    const debitList = this.dataSource.filter(data => data.movement === 'D');
    const creditList = this.dataSource.filter(data => data.movement === 'C');


    const totalCredit = creditList.reduce((sum, item) => sum + item.amount, 0);


    debitList.forEach(item => {
      item.amount = totalCredit;
    });

    this.totalDebit = totalCredit;
    this.totalCredit = totalCredit;
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

    if (this.selectRow.referenceNumber != '' && this.validate()) {



      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );

      if (!dialogo) {
        return;
      }
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

    const copiaTransaction = {...transaccion};

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


    this.selectRow = transaccion;

    this.handleDocumentType(transaccion);

  }


  private handleDocumentType(transaccion: LocalData): void {


    if (this.creditNotes.dayri != 0 && transaccion.documentType != null) {
      this.journalForm = this.journalList.find((item) => item.id == this.creditNotes.dayri);


      this.accountService.getAllAccount().subscribe({
        next: (data) => {
          this.accountList = data
            .filter(item => item.supportEntry && item.balances.length > 0 && item.accountType === JournalTypes.Ventas
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
          "accountName": this.journalForm?.defaultAccountName ?? '',
          "debit": 0,
          "credit": 0
        });

        this.dataSource = transaccion?.details??[];
        setTimeout(() => this.hideEditDeleteButtons(accountToCheck), 100);

        this.updateAmounts();


      });

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

