import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
import config from 'devextreme/core/config';



interface LocalData {
  id: number;
  referenceNumber?: string;
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

  isViewOnly = false;

  accountList: AccountModel[] = [];
  showDetails: boolean = false;

  //
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly adjustemntService = inject(AdjusmentService);
  private readonly journalService = inject(JournalService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);

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
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }



  ngOnInit() {
    // 1. Detectar si estamos en modo view (para bloquear edición)
    this.activeRouter.queryParamMap.subscribe(qp => {
      const mode = qp.get('mode');
      this.isViewOnly = (mode === 'view');
      if (this.isViewOnly) {
        this.allowAddEntry = false;
      }
    });

    // 2. Cargar cuentas (una sola vez, con cache)
    this.loadAccountsOnce();

    // 3. Cargar TODAS las transacciones base (para armar dataTable e info de la partida original)
    this.transService.getAll().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);

        // <- intenta inicializar el bloque "Partida # ..." si ya sabemos qué transacción corresponde
        this.initOriginalTransactionFromDataTable();
      },
    });

    // 4. Leer el :id del ajuste (si existe, es edición / view)
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);

      if (findId) {
        // si estoy editando / viendo un ajuste existente,
        // no permito agregar nuevas filas inicialmente
        this.allowAddEntry = false;

        this.adjustemntService.getAdjustmentById(findId).subscribe({
          next: (data) => {
            // info cabecera del ajuste
            this.selectRow.referenceNumber = data.invoiceNo;
            this.description = data.descriptionAdjustment;
            this.status = data.status;

            // guarda el transactionId real al que pertenece este ajuste
            this.selectRow.id = data.transactionId;

            // líneas del ajuste que se van a editar en el grid
            this.dataSource = data.adjustmentDetails.map((item: any) => ({
              accountId: item.accountId,
              amount: item.amount,
              id: item.id,
              movement: item.shortEntryType,
              accountName: item.accountName,
              debit: item.debit,
              credit: item.credit
            } as Transaction));

            this.updateAmounts();

            // <- intenta inicializar el bloque "Partida # ..." ahora que ya tenemos transactionId
            this.initOriginalTransactionFromDataTable();
          }
        });
      }
    });
  }

  private loadAccountsOnce(): void {
    this.allowAddEntry = false;

    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => item.supportEntry)
          .map(item => ({
            id: item.id,
            description: item.name,
            code: item.accountCode
          } as AccountModel));

        this.allowAddEntry = !this.isViewOnly;
      },
      error: (err) => {
        console.error('Error cargando cuentas', err);
      }
    });
  }

  private initOriginalTransactionFromDataTable(): void {
    if (!this.selectRow?.id || !this.dataTable || this.dataTable.length === 0) {
      return;
    }

    const transaccionBase = this.dataTable.find(
      d => d.id === this.selectRow.id
    );

    if (!transaccionBase) {
      return;
    }

    this.transactionOriginal = {
      numberPda: transaccionBase.numberPda ?? '',
      totalDebit: (transaccionBase.details ?? [])
        .filter(d => d.movement === 'D')
        .reduce((t, i) => t + i.amount, 0),
      totalCredit: (transaccionBase.details ?? [])
        .filter(d => d.movement === 'C')
        .reduce((t, i) => t + i.amount, 0),
      details: (transaccionBase.details ?? []).map(item => ({
        id: item.id,
        nameAccount: item.accountName ?? '',
        debe: item.movement === 'D' ? item.amount : 0,
        haber: item.movement === 'C' ? item.amount : 0,
      } as DetailsPda)),

    };

    this.showDetails = true;

    this.getAllAdjustmentByTransaction(transaccionBase.id);
  }


  async saveRow(e: any): Promise<void> {
    this.updateAmounts();
  }

  removedRow(e: any): void {
    this.updateAmounts();

  }


  updateRow(e: any): void {

    this.updateAmounts();
  }


  private updateAmounts(): void {
    if (this.dataSource.length > 0) {
      const totalDebit = this.dataSource
        .filter(item => item.movement === 'D')
        .reduce((sum, item) => sum + item.amount, 0);

      const totalCredit = this.dataSource
        .filter(item => item.movement === 'C')
        .reduce((sum, item) => sum + item.amount, 0);

      this.totalDebit = parseFloat(totalDebit.toFixed(2));
      this.totalCredit = parseFloat(totalCredit.toFixed(2));
    } else {
      this.totalDebit = 0;
      this.totalCredit = 0;
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
      this.cdRef.detectChanges();
      //console.log('invalida number of tnx');
      return false;
    }
    // operar sobre el total y verificar que lleve a cero la operación
    const total = this.totalCredit - this.totalDebit;
    if (total !== 0) {
      this.messageToast =
        'El balance no es correcto, por favor ingrese los valores correctos.';
      this.showToast = true;
      this.toastType = typeToast.Error;
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
          return (item.documentType === JournalTypes.Ventas && element.entryType === "Credito") ||
            (item.documentType === JournalTypes.Compras && element.entryType === "Debito");
        }) || { amount: 0 }; // Manejo de caso donde no se encuentra el detalle

        return {
          id: item.id,
          date: item.date,
          referenceNumber: item.reference,
          documentType: item.documentType,
          numberPda: item.numberPda,
          diaryType: item.diaryType,
          reference: item.documentType == JournalTypes.Ventas || item.documentType == JournalTypes.Compras ? "" : item.description,
          journalEntry: item.documentType == JournalTypes.Ventas ? "Ventas" : "Compras",
          total: totalDetail.amount,
          status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
          details: item.transactionDetails.map((item: any) => ({
            accountId: item.accountId,
            amount: item.amount,
            id: item.id,
            movement: item.shortEntryType == "C" ? "C" : "D",
            accountName: item.accountName
          }))
        } as LocalData;
      });
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  async onSubmit(e: NgForm) {
    if (!e.valid || this.selectRow.referenceNumber === '') {
      this.toastType = typeToast.Error;
      this.messageToast = 'Complete todos los campos requeridos correctamente.';
      this.showToast = true;
      this.cdRef.detectChanges();
      return;
    }

    if (!this.validate()) return;


    const request: AdjustmentRequest = {
      transactionId: this.selectRow.id,
      reference: 'Ajuste',
      descriptionAdjustment: e.form.value.description,
      detailAdjustment: this.dataSource.map((detail) => ({
        id: detail.id,
        accountId: detail.accountId,
        amount: detail.amount,
        motion: detail.movement,
      })),
    };

    let dialogo = await confirm('¿Está seguro de que desea guardar los cambios?', 'Advertencia');
    if (!dialogo) return;

    const id = Number(this.id);

    if (id) {
      this.adjustemntService.updateAdjustment(id, request).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Ajuste actualizado correctamente.';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/adjustment-list']);
          }, 2000);
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = err.message || 'Error al actualizar el ajuste.';
          this.showToast = true;
          console.error('Error actualizando ajuste:', err);
        },
      });
    } else {
      this.adjustemntService.createAdjusment(request).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Ajuste creado correctamente.';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/adjustment-list']);
          }, 2000);
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = err.message || 'Error al crear el ajuste.';
          this.showToast = true;
          console.error('Error creando ajuste:', err);
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
    const transaccionEncontrada = this.dataTable.find(d => d.referenceNumber === referenceNumber);
    const transaccion: LocalData = transaccionEncontrada ? { ...transaccionEncontrada } : { id: 0, referenceNumber: '' };
    if (!transaccion) return;

    // Reset de UI vinculada
    this.showDetails = false;

    // *** LIMPIA AJUSTES ANTERIORES ***
    this.listAdjustmentByTransaction = [];
    this.showDetailsAdjustment = [];

    this.documentType = transaccion.documentType!;
    this.journalService.getJournalById(transaccion.diaryType!).subscribe(data => this.journalForm = data);

    this.transactionOriginal = {
      numberPda: transaccion.numberPda ?? '',
      totalDebit: (transaccion.details ?? [])
        .filter(d => d.movement === 'D')
        .reduce((t, i) => t + i.amount, 0),
      totalCredit: (transaccion.details ?? [])
        .filter(d => d.movement === 'C')
        .reduce((t, i) => t + i.amount, 0),
      details: (transaccion.details ?? []).map(item => ({
        id: item.id,
        nameAccount: item.accountName,
        debe: item.movement === 'D' ? item.amount : 0,
        haber: item.movement === 'C' ? item.amount : 0,
      })),
    } as TransactionPda;


    const copiaTransaccion = { ...transaccion };

    // Pide ajustes (si no hay id válido, asegura arrays vacías)
    if (copiaTransaccion.id) {
      this.getAllAdjustmentByTransaction(copiaTransaccion.id);
    } else {
      this.listAdjustmentByTransaction = [];
      this.showDetailsAdjustment = [];
    }

    // voltea movimientos para el grid de edición
    copiaTransaccion.details?.forEach(detail => {
      if (detail.movement === "D" || detail.movement === "C") {
        detail.movement = detail.movement === "D" ? "C" : "D";
      }
    });

    this.dataSource = copiaTransaccion.details || [];
    this.selectRow = transaccion;
    this.handleDocumentType(transaccion.documentType);
    this.updateAmounts();
  }



  private handleDocumentType(documentType: number | undefined): void {
    if (documentType === JournalTypes.Ventas || documentType === JournalTypes.Compras) {
      const accountType = documentType === JournalTypes.Ventas ? JournalTypes.Ventas : JournalTypes.Compras;
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
    this.listAdjustmentByTransaction = [];
    this.showDetailsAdjustment = [];

    this.adjustemntService.getAllAdjustmentByTrasactionId(id).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.listAdjustmentByTransaction = [];
          this.showDetailsAdjustment = [];
          return;
        }

        this.listAdjustmentByTransaction = data.map((t: any) => ({
          numberPda: t.descriptionAdjustment,
          totalDebit: (t.adjustmentDetails || [])
            .filter((i: any) => i.shortEntryType === 'D')
            .reduce((acc: number, i: any) => acc + i.amount, 0),
          totalCredit: (t.adjustmentDetails || [])
            .filter((i: any) => i.shortEntryType === 'C')
            .reduce((acc: number, i: any) => acc + i.amount, 0),
          date: t.creationDate ? t.creationDate.substring(0, 10) : '',
          user: t.user ?? '',
          details: (t.adjustmentDetails || []).map((i: any) => ({
            id: i.id,
            nameAccount: i.accountName,
            debe: i.shortEntryType === 'D' ? i.amount : 0,
            haber: i.shortEntryType === 'C' ? i.amount : 0,
          }))
        }));

        this.showDetailsAdjustment = Array(this.listAdjustmentByTransaction.length).fill(false);
      },
      error: () => {
        this.listAdjustmentByTransaction = [];
        this.showDetailsAdjustment = [];
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

  enableEdit = () => {
    if (this.isViewOnly) return false;
    return this.status !== 'SUCCESS';
  };


  amountGreaterThanZero = (e: { value: any }) => {
    const n = typeof e.value === 'number' ? e.value : parseFloat((e.value || '').toString().replace(/,/g, ''));
    return !isNaN(n) && n > 0;
  };


  onRowValidating(e: DxDataGridTypes.RowValidatingEvent) {
    const data = { ...(e.oldData || {}), ...(e.newData || {}) };
    const missingAccount = !data.accountId;
    const missingMovement = !data.movement;
    const invalidAmount = !(typeof data.amount === 'number' && data.amount > 0);

    if (missingAccount || missingMovement || invalidAmount) {
      e.isValid = false;
      const msg =
        (missingAccount ? '• Seleccione una cuenta.\n' : '') +
        (missingMovement ? '• Seleccione el movimiento (Debe/Haber).\n' : '') +
        (invalidAmount ? '• El monto debe ser mayor que 0.\n' : '');
      this.toastType = typeToast.Error;
      this.messageToast = 'No se pudo guardar la fila:\n' + msg;
      this.showToast = true;
    }
  }

  onSaving(e: DxDataGridTypes.SavingEvent) {
    if (!e.changes || e.changes.length === 0) return;

    for (const ch of e.changes) {
      const currentRow =
        e.component.getVisibleRows().find(r => r.key === ch.key)?.data || {};

      const data = { ...currentRow, ...(ch.data || {}) };

      const missingAccount = !data.accountId;
      const missingMovement = !data.movement;
      const invalidAmount = !(typeof data.amount === 'number' && data.amount > 0);

      if (missingAccount || missingMovement || invalidAmount) {
        e.cancel = true;
        const msg =
          (missingAccount ? '• Seleccione una cuenta.\n' : '') +
          (missingMovement ? '• Seleccione el movimiento (Debe/Haber).\n' : '') +
          (invalidAmount ? '• El monto debe ser mayor que 0.\n' : '');
        this.toastType = typeToast.Error;
        this.messageToast = 'Complete los campos requeridos antes de guardar:\n' + msg;
        this.showToast = true;
        return;
      }
    }
  }


}
