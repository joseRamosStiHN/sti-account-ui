import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { AccountModel } from 'src/app/modules/accounting/models/AccountModel';
import { IMovement, Notes, Transaction, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { NgForm } from '@angular/forms';
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
  numberPda?: string;
  documentType?: number;
  diaryType?: number;
  details?: Transaction[];
}

interface TransactionPda {
  numberPda: number;
  totalDebit: number;
  totalCredit: number;
  details: DetailsPda[];
}

export interface DetailsPda {
  id: number;
  nameAccount: string;
  debe: number;
  haber: number;
}

@Component({
  selector: 'app-debit-notes',
  templateUrl: './debit-notes.component.html',
  styleUrl: './debit-notes.component.css'
})
export class DebitNotesComponent {
  // cabecera form
  debitNotes: Notes = {
    reference: 0,
    date: new Date(),
    dayri: null as any,
    applyPorcent: 'no',
    percent: 0,
    description: '',
  };

  description: string = '';
  journalList: JournalModel[] = [];

  // detalle grid
  dataSource: Transaction[] = [];

  // bloque "Partida # ... / Mostrar detalles"
  transactionOriginal: TransactionPda = {
    numberPda: 0,
    totalDebit: 0,
    totalCredit: 0,
    details: []
  };

  // historial de notas de débito anteriores
  listCredtiNotesByTransaction: any[] = [];
  showDetailsAdjustment: boolean[] = [];

  // totales dinámicos del grid actual
  totalCredit: number = 0;
  totalDebit: number = 0;

  // control UI
  allowAddEntry: boolean = true; // para el botón Add Row del grid
  isViewOnly = false;            // modo lectura (bloqueado)
  status: string = "";           // DRAFT | SUCCESS | etc

  // para saber si es nueva, edición o vista
  id: string | null = null;

  // selects auxiliares
  listMovement: IMovement[] = [
    { code: 'D', name: 'Debe' },
    { code: 'C', name: 'Haber' },
  ];

  documentType!: number;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  accountList: AccountModel[] = [];
  creditTransaction: LocalData[] = []; // lista de transacciones base
  journalForm?: JournalModel;

  // modal
  popupVisible = false;

  // referencia contable seleccionada
  selectRow: LocalData = {
    id: 0,
    referenceNumber: ""
  };

  // UI detalle partida
  showDetails: boolean = false;

  private lastBuiltKey: string | null = null;
  private buildingDataSource = false;

  // services / router
  private readonly accountService = inject(AccountService);
  private readonly transService = inject(TransactionService);
  private readonly journalService = inject(JournalService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);

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
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  ngOnInit() {
    // 0. detectar si venimos en modo vista (query param mode=view igual que ajustes)
    this.activeRouter.queryParamMap.subscribe((qp) => {
      const mode = qp.get('mode');
      this.isViewOnly = (mode === 'view');

      // si solo estoy viendo, no puedo agregar filas
      this.allowAddEntry = !this.isViewOnly;
    });



    // 1. cargar cuentas
    this.loadAccountsOnce();

    // 2. cargar diarios
    this.journalService.getAllAccountingJournal().subscribe({
      next: (data) => {
        this.journalList = data
          .filter((item: any) => item.accountTypeName === "Compras" && item.status);
      },
    });

    // 3. cargar todas las transacciones base (las partidas SUCCESS de compras)
    this.transService.getAll().subscribe({
      next: (data) => {
        this.creditTransaction = this.fillDataSource(data);

        // si ya conocemos el transactionId (por edición), vamos a intentar armar Partida#
        this.initOriginalTransactionSection();
      },
    });

    // 4. leer :id de la ruta (si existe -> estamos editando / viendo una nota existente)
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);

      if (findId) {

        this.transService.getNoteDebitById(findId).subscribe({
          next: (data) => {
            this.selectRow.referenceNumber = data.invoiceNo;
            this.selectRow.id = data.transactionId;
            this.description = data.descriptionNote;
            this.debitNotes.date = data.date;
            this.debitNotes.dayri = data.diaryType;
            this.status = data.status;

            if (this.status !== 'DRAFT') {
              this.isViewOnly = true;
            }

            this.allowAddEntry = !this.isViewOnly;

            this.dataSource = data.detailNote.map((item: any) => ({
              accountId: item.accountId,
              amount: item.amount,
              id: item.id,
              movement: item.shortEntryType,
              accountName: item.accountName,
              debit: item.debit,
              credit: item.credit
            }) as Transaction);

            this.updateAmounts();
            this.initOriginalTransactionSection();
          }
        });
      }

    });
  }

  // ===================== helpers init =====================

  private loadAccountsOnce(): void {
    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        this.accountList = data
          .filter((item: any) => item.supportEntry || item.id == this.journalForm?.defaultAccount)
          .map((item: any) => ({
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


  private initOriginalTransactionSection(): void {
    if (!this.selectRow?.id || this.creditTransaction.length === 0) return;

    const base = this.creditTransaction.find(d => d.id === this.selectRow.id);
    if (!base) return;

    this.transactionOriginal = {
      numberPda: base.numberPda ? parseInt(base.numberPda, 10) : 0,
      totalDebit: (base.details ?? [])
        .filter(d => d.movement === 'D')
        .reduce((t, i) => t + i.amount, 0),
      totalCredit: (base.details ?? [])
        .filter(d => d.movement === 'C')
        .reduce((t, i) => t + i.amount, 0),
      details: (base.details ?? []).map(item => ({
        id: item.id,
        nameAccount: item.accountName,
        debe: item.movement === 'D' ? item.amount : 0,
        haber: item.movement === 'C' ? item.amount : 0,
      })) as DetailsPda[]
    };

    this.showDetails = true;

    if (base.id) {
      this.getAllDebitByTransaction(base.id);
    } else {
      this.listCredtiNotesByTransaction = [];
      this.showDetailsAdjustment = [];
    }
  }

  // ================= GRID handlers =================

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
      const debe = this.dataSource
        .filter((data) => data.movement === 'D')
        .reduce((sum, item) => sum + item.amount, 0);

      const haber = this.dataSource
        .filter((data) => data.movement === 'C')
        .reduce((sum, item) => sum + item.amount, 0);

      this.totalCredit = parseFloat(haber.toFixed(2));
      this.totalDebit = parseFloat(debe.toFixed(2));
    } else {
      this.totalCredit = 0;
      this.totalDebit = 0;
    }
  }

  calculateSummary(options: any) {
    if (options.name === 'totalDebit' || options.name === 'totalCredit') {
      switch (options.summaryProcess) {
        case 'start':
          options.totalValue = 0;
          break;
        case 'calculate':
          if (options.name === 'totalDebit' && options.value.movement === 'D') {
            options.totalValue += options.value.amount;
          }
          if (options.name === 'totalCredit' && options.value.movement === 'C') {
            options.totalValue += options.value.amount;
          }
          break;
      }
    }
  }

  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false);
  }

  // ================= VALIDACIONES GRID =================

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

  // ================= VALIDACIÓN FORM COMPLETO =================

  private validate(): boolean {
    this.messageToast = '';
    this.showToast = false;

    if (this.dataSource.length < 2) {
      this.messageToast = 'Debe agregar al menos 2 transacciones';
      this.showToast = true;
      this.toastType = typeToast.Error;
      return false;
    }

    const total = this.totalCredit - this.totalDebit;
    if (total !== 0) {
      this.messageToast = 'El balance no es correcto, por favor ingrese los valores correctos';
      this.showToast = true;
      this.toastType = typeToast.Error;
      return false;
    }

    const hasDuplicateAccountId = this.dataSource.some((item) => {
      return this.dataSource.filter(obj => obj.accountId === item.accountId).length > 1;
    });

    if (hasDuplicateAccountId) {
      this.messageToast = 'No se puede registrar la misma cuenta en la transaccion';
      this.showToast = true;
      this.toastType = typeToast.Error;
      return false;
    }

    return true;
  }

  // ================= UI HELPERS =================

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  toggleDetailsAdjustment(index: number) {
    this.showDetailsAdjustment[index] = !this.showDetailsAdjustment[index];
  }

  trackByFn(index: number, item: any) {
    return item.numberPda;
  }

  showModal() {
    // si está en modo solo lectura, que no abra el popup
    if (this.isViewOnly) return;
    this.popupVisible = !this.popupVisible;
  }

  goBack() {
    window.history.back();
  }

  getCredit(dataRow: any) {
    return dataRow.movement === "C" ? dataRow.amount : 0;
  }
  getDebit(dataRow: any) {
    return dataRow.movement === "D" ? dataRow.amount : 0;
  }

  enableEdit = () => {
    if (this.isViewOnly) return false;
    return this.status !== 'SUCCESS';
  };

  // ================= eventos selección referencia =================

  onRowSelected(event: any): void {
    if (this.isViewOnly) return;

    const reference = event.selectedRowsData[0];
    if (reference && reference.referenceNumber) {
      this.handleTransaction(reference.referenceNumber);
    }
  }

  onValueChange(reference: string): void {
    if (this.isViewOnly) return;

    if (reference) {
      this.handleTransaction(reference);
    }
  }

  onChangeJournal(e: any) {
    if (this.isViewOnly) return;

    if (e.target.value) {
      this.handleDocumentType(this.selectRow);
    }
  }

  // ================= lógica al seleccionar partida base =================

  private handleTransaction(referenceNumber: string): void {
    const transaccionEncontrada = this.creditTransaction.find(data => data.referenceNumber === referenceNumber);
    const transaccion: LocalData = transaccionEncontrada
      ? { ...transaccionEncontrada }
      : { id: 0, referenceNumber: '' };

    if (!transaccion) return;
    this.documentType = transaccion.documentType!;

    // cabecera
    this.selectRow = transaccion;

    // partida original resumida (se parece a ajustes)
    this.transactionOriginal = {
      numberPda: transaccion.numberPda ? parseInt(transaccion.numberPda, 10) : 0,
      totalDebit: transaccion.details?.filter(d => d.movement === "D").reduce((t, i) => t + i.amount, 0) ?? 0,
      totalCredit: transaccion.details?.filter(d => d.movement === "C").reduce((t, i) => t + i.amount, 0) ?? 0,
      details: (transaccion.details ?? []).map(item => ({
        id: item.id,
        nameAccount: item.accountName,
        debe: item.movement == 'D' ? item.amount : 0,
        haber: item.movement == 'C' ? item.amount : 0,
      })) as DetailsPda[]
    };

    // historial notas de débito existentes en esa transacción
    if (transaccion.id) {
      this.getAllDebitByTransaction(transaccion.id);
    } else {
      this.listCredtiNotesByTransaction = [];
      this.showDetailsAdjustment = [];
    }

    // armar grid editable inicial (líneas D + contrapartida C)
    this.handleDocumentType(transaccion);

    // asegurar que ya se muestre la tarjeta Partida #
    this.showDetails = true;

    this.updateAmounts();
  }

  private handleDocumentType(transaccion: LocalData): void {
    if (!transaccion || transaccion.id == null) return;
    if (!this.debitNotes.dayri || this.debitNotes.dayri === 0) return;
    if (transaccion.documentType == null) return;

    const buildKey = `${transaccion.id}-${this.debitNotes.dayri}`;
    if (this.buildingDataSource) return;
    if (this.lastBuiltKey === buildKey) return;

    this.buildingDataSource = true;

    // diario elegido actualmente en pantalla
    this.journalForm = this.journalList.find(
      (item) => item.id == this.debitNotes.dayri
    );

    // necesitamos conocer la cuenta default del diario de la transacción original
    this.journalService.getJournalById(transaccion.diaryType!).subscribe({
      next: (journalDefault) => {
        this.accountService.getAllAccountCached().subscribe({
          next: (accountsData) => {
            // cuentas filtradas (mismas reglas tuyas)
            this.accountList = accountsData
              .filter(
                (item: any) =>
                  item.supportEntry ||
                  item.id == this.journalForm?.defaultAccount
              )
              .map((item: any) => ({
                id: item.id,
                description: item.name,
                code: item.accountCode,
              } as AccountModel));

            // clonar detalle base
            const copiaDetails = (transaccion.details || []).map(d => ({ ...d }));

            // quitar la cuenta default ORIGINAL
            const filteredDetails = copiaDetails.filter(
              line => line.accountId !== journalDefault.defaultAccount
            );

            // todas las líneas restantes a "D"
            filteredDetails.forEach(d => d.movement = "D");

            // calcular total para contrapartida
            const total = filteredDetails.reduce(
              (sum, d) => sum + (d.amount || 0),
              0
            );

            // armar contrapartida tipo "C" usando el diario seleccionado
            const finalRows = [...filteredDetails];

            if (
              this.journalForm?.defaultAccount != null &&
              this.journalForm?.defaultAccountName != null &&
              this.journalForm.defaultAccountName.trim() !== ''
            ) {
              finalRows.push({
                id: 0,
                accountId: this.journalForm.defaultAccount,
                amount: total ?? 0,
                movement: "C",
                accountName: this.journalForm.defaultAccountName,
              } as Transaction);
            }

            // solo regeneramos si estamos creando NUEVA nota,
            // en edición de nota existente ya tenemos this.dataSource desde el backend:
            if (!this.id) {
              this.dataSource = finalRows;
            }

            this.updateAmounts();

            this.lastBuiltKey = buildKey;
            this.buildingDataSource = false;
          },
          error: (err) => {
            console.error('Error cargando cuentas filtradas:', err);
            this.buildingDataSource = false;
          }
        });
      },
      error: (err) => {
        console.error('Error getJournalById:', err);
        this.buildingDataSource = false;
      }
    });
  }

  // ================= historial notas débito =================

  getAllDebitByTransaction(id: number) {
    this.transService.getAllDebitNoteByTrasactionId(id).subscribe({
      next: (data) => {
        this.listCredtiNotesByTransaction = data.map((transaction: any) => ({
          numberPda: transaction.descriptionNote,
          totalDebit: transaction.detailNote?.filter((i: any) => i.shortEntryType === "D")
            .reduce((acc: number, i: any) => acc + i.amount, 0),
          totalCredit: transaction.detailNote?.filter((i: any) => i.shortEntryType === "C")
            .reduce((acc: number, i: any) => acc + i.amount, 0),
          date: transaction.date,
          user: transaction.user,
          details: transaction.detailNote?.map((i: any) => ({
            id: i.id,
            nameAccount: i.accountName,
            debe: i.shortEntryType === 'D' ? i.amount : 0,
            haber: i.shortEntryType === 'C' ? i.amount : 0,
          })) as DetailsPda[]
        }));

        this.showDetailsAdjustment = Array(this.listCredtiNotesByTransaction.length).fill(false);
      }
    });
  }

  // ================= submit =================

  async onSubmit(e: NgForm) {
    // si estoy en modo view, no debería ni intentar guardar
    if (this.isViewOnly) return;

    if (this.selectRow.referenceNumber === '' || !e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Complete todos los campos requeridos correctamente.';
      this.showToast = true;
      this.cdRef.detectChanges();
      return;
    }

    if (!this.validate()) return;

    const request: any = {
      transactionId: this.selectRow.id,
      descriptionNote: e.form.value.description,
      diaryType: e.form.value.dayri,
      createAtDate: e.form.value.date,
      detailNote: this.dataSource.map((detail) => ({
        id: detail.id,
        accountId: detail.accountId,
        amount: detail.amount,
        motion: detail.movement,
      })),
    };

    const dialogo = await confirm(
      this.id
        ? '¿Está seguro de que desea guardar los cambios?'
        : '¿Está seguro de que desea crear la nota de débito?',
      'Advertencia'
    );
    if (!dialogo) return;

    const currentId = Number(this.id);

    if (currentId) {
      // UPDATE
      this.transService.updateDebitNote(currentId, request).subscribe({
        next: () => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Nota de Débito actualizada correctamente.';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/debitnotes-list']);
          }, 2000);
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = err.message || 'Error al actualizar la Nota de Débito.';
          this.showToast = true;
          console.error('Error actualizando nota de débito:', err);
        },
      });
    } else {
      // CREATE
      this.transService.createTransactionDebitNotes(request).subscribe({
        next: () => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Nota de Débito creada correctamente.';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/debitnotes-list']);
          }, 2000);
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = err.message || 'Error al crear la Nota de Débito.';
          this.showToast = true;
          console.error('Error creando nota de débito:', err);
        },
      });
    }
  }

  // ================= utils para template =================

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };

  customCurrencyText(cellInfo: any): string {
    return cellInfo.valueText.replace('USD', '$').replace('HNL', 'L');
  }

  fillDataSource(data: any[]): LocalData[] {
    return data
      .filter((item: any) => item.status == "SUCCESS" && item.documentType === JournalTypes.Compras)
      .map((item: any) => ({
        id: item.id,
        date: item.date,
        referenceNumber: item.reference,
        documentType: item.documentType,
        numberPda: item.numberPda,
        diaryType: item.diaryType,
        reference:
          item.documentType == JournalTypes.Compras || item.documentType == JournalTypes.Compras
            ? ""
            : item.description,
        journalEntry: item.documentType == JournalTypes.Compras ? "Ventas" : "Compras",
        total: item.amount,
        status: item.status.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
        details: item.transactionDetails.map((d: any) => ({
          accountId: d.accountId,
          amount: d.amount,
          id: d.id,
          movement: d.shortEntryType == "D" ? "D" : "C",
          accountName: d.accountName,
          debit: d.shortEntryType === "C" ? d.amount : 0,
          credit: d.shortEntryType == "D" ? d.amount : 0
        })) as Transaction[]
      }));
  }

  posting() {
    confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    ).then(async (d) => {
      if (d) {
        const transId = Number(this.id);

        this.transService.putStatusDebitNotes(transId).subscribe({
          next: () => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Nota de Débito confirmada correctamente.';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/accounting/debitnotes-list']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error al confirmar la Nota de Débito:', err);
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar publicar la transacción';
            this.showToast = true;
          },
        });
      }
    });
  }
}
