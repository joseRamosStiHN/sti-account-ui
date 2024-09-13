import { Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { IMovement, Transaction, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { NgForm } from '@angular/forms';
import { AdjustmentRequest } from 'src/app/modules/accounting/models/APIModels';
import { AdjusmentService } from 'src/app/modules/accounting/services/adjusment.service';


interface LocalData {
  id: number;
  referenceNumber?: string; // este es el numero de factura de cliente o proveedor o banco etc,
  reference?: string;
  journalEntry?: string;
  journalEntryId?: number;
  total?: number;
  status?: string;
  date?: Date;
  numberPda?:string
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


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  accountList: AccountModel[] = [];
  dataSource: Transaction[] = [];
  dataTable: LocalData[] = [];

  // modal
  popupVisible = false;

  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly adjustemntService = inject(AdjusmentService);

  selectRow: LocalData = {
    id: 0,
    referenceNumber: ""
  }


  editorOptions = {
    itemTemplate: 'accounts',
    searchEnabled: true,
    searchMode: 'contains',
    searchExpr: ['description', 'code']
  };



  ngOnInit() {

    this.transService.getAll().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });

    this.accountService.getAllAccount().subscribe({
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

  async save() {
    if (this.validate()) {

      console.log(this.dataSource);



      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );

      if (!dialogo) {
        return;
      }





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
    this.totalDebit = totalDebit; // actualiza en la vista
    this.totalCredit = totalCredit;



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

  
    return data.map((item: any) => {
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
        numberPda:item.numberPda,
        reference: item.documentType == JournalTypes.Ventas || item.documentType == JournalTypes.Compras
          ? "" : item.description,
        journalEntry: item.documentType == JournalTypes.Ventas ? "Ventas" : "Compras",
        total: totalDetail.amount,
        status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
      } as LocalData;


    })


  }

  async onSubmit(e: NgForm) {
    if (this.selectRow.referenceNumber != '' && this.validate()) {
      
      const request:AdjustmentRequest ={

        transactionId:this.selectRow.id,
        reference:"Ajuste",
        detailAdjustment:this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          };
        }),
      };

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

  onRowSelected(event: any) {
    this.selectRow = event.selectedRowsData[0];

  }

  onValueChange(reference:string): void {
    const transaccion = this.dataTable.find((data) => data.referenceNumber== reference);
    if (transaccion?.id) {
      this.selectRow = transaccion;
      
    }    
    
  }

}
