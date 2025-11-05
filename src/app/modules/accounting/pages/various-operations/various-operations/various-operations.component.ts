import { Component,  inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import config from 'devextreme/core/config';
import { confirm } from 'devextreme/ui/dialog';
import {
  ClientBilling,
  IMovement,
  Transaction,
  typeToast,
} from '../../../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionModel } from '../../../models/TransactionModel';
import { ToastType } from 'devextreme/ui/toast';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/AccountModel';
import { AccountAPIResponse, AccountTypeResponse, TransactionResponse } from '../../../models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { JournalModel } from 'src/app/modules/accounting/models/JournalModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { firstValueFrom } from 'rxjs';

interface LocalAccountType {
  id: number;
  name: string;
  isActive: boolean;
}


@Component({
  selector: 'app-various-operations',
  templateUrl: './various-operations.component.html',
  styleUrl: './various-operations.component.css'
})
export class VariousOperationsComponent {


  allowAddEntry: boolean = true;
  id: string | null = null;
  totalCredit: number = 0;
  totalDebit: number = 0;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  buttonTextPosting: string = 'Confirmar';
  disablePosting: boolean = false;
  variousOperations: ClientBilling;
  dataSource: Transaction[] = [];
  accountsFilter: AccountAPIResponse[] = [];
  accounts: AccountAPIResponse[] = [];
  selectedTypeId: string = '';
  private previousDiaryType: number | undefined;

  journalList: JournalModel[] = [];
  selectedJournal?: JournalModel | null = null;
  selectedTypeName: String | null = null;
  journalTypes: Observable<LocalAccountType[] | null> = new BehaviorSubject(
    null
  );
  editorOptions = {
    itemTemplate: 'accounts',
    searchEnabled: true,
    searchMode: 'contains',
    searchExpr: ['description', 'code'],
    onOpened: (e: any) => {
      const popupElement = e.component._popup.$content();
      const listItems = popupElement.find('.dx-list-item');
      this.selectedJournal = this.journalList.find(
        (journal) => journal.id === this.variousOperations.diaryType
      );
      listItems.each((index: number, item: any) => {
        const codeAccount = item.textContent.split(' ')[0];
        const shouldHideItem = codeAccount === this.selectedJournal?.defaultAccountCode;
        item.style.display = shouldHideItem ? 'none' : 'block';
        if (shouldHideItem) {
          popupElement[0].style.height = 'auto';
        }
      });
    }
  };

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
  accountList: AccountModel[] = [];

  @ViewChild('itemForm') itemForm!: NgForm;

  private readonly router = inject(Router);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly transactionService = inject(TransactionService);
  private readonly accountService = inject(AccountService);
  private readonly periodService = inject(PeriodService);
  private readonly journalService = inject(JournalService);

  constructor() {
    this.variousOperations = {
      billingNumber: '',
      date: new Date(),
      currency: '',
      exchangeRate: 0,
      description: '',
      typePayment: '',
      methodPayment: '',
      rtn: '',
      supplierName: ''
    };

    this.showToast = false;
    this.messageToast = '';
    this.toastType = typeToast.Info;

    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.variousOperations.id = Number(this.id);
      const findId = Number(this.id);
      if (findId) {
        this.transactionService.getTransactionById(findId).subscribe({
          next: (data) => this.fillBilling(data),
        });
      } else {
        this.periodService.getStatusPeriod().subscribe({
          next: (status) => {
            if (!status) {
              this.react();
            }
          },
          error: (err) => this.router.navigate(['/accounting/various-operations-list']),
        });
      }
    });

    const excludedTypes = ['Ingresos', 'Gastos'];

    this.journalTypes = this.journalService.getAllAccountType().pipe(
      map((results: AccountTypeResponse[]): LocalAccountType[] =>
        results
          .filter(result => !excludedTypes.includes(result.name))
          .map((result: AccountTypeResponse) => {
            return {
              id: result.id,
              isActive: false,
              name: result.name,
            };
          })
      )
    );
  }

  async onSubmit(e: NgForm) {

    if (!e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor, complete todos los campos requeridos.';
      this.showToast = true;
      return;
    }

    if (this.dataSource.length === 0) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Debe agregar al menos una transacción antes de continuar.';
      this.showToast = true;
      return;
    }

    if (e.valid && this.validate()) {
      const accountTypeId = this.variousOperations.diaryType;

      if (accountTypeId === undefined || accountTypeId === null) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Tipo de diario no definido.';
        this.showToast = true;
        return;
      }

      try {
        const journal = await firstValueFrom(this.journalService.getJournalByAccountType(accountTypeId));

        if (!journal || !journal.id) {
          this.toastType = typeToast.Error;
          this.messageToast = 'No se pudo obtener el diario para el tipo seleccionado';
          this.showToast = true;
          return;
        }

        this.variousOperations.diaryType = journal.id;

        const transactionData: TransactionModel = {
          createAtDate: this.variousOperations.date,
          reference: this.variousOperations.billingNumber,
          documentType: 5,
          exchangeRate: 25.82,
          descriptionPda: this.variousOperations.description,
          currency: "L",
          diaryType: this.variousOperations.diaryType,
          typeSale: null,
          typePayment: null,
          rtn: null,
          supplierName: null,
          detail: this.dataSource.map((detail) => ({
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          })),
        };


        const dialogo = await confirm(
          `¿Está seguro de que desea realizar esta acción?`,
          'Advertencia'
        );

        if (!dialogo) {
          return;
        }

        if (this.id) {
          transactionData.id = Number(this.id);
          this.transactionService.updateTransaction(transactionData.id, transactionData)
            .subscribe({
              next: (data) => {
                this.fillBilling(data);
                this.toastType = typeToast.Success;
                this.messageToast = 'Registro actualizado exitosamente.';
                this.showToast = true;
                setTimeout(() => {
                  this.router.navigate(['/accounting/various-operations-list']);
                }, 2000);
              },
              error: (err) => {
                this.toastType = typeToast.Error;
                this.messageToast = err.message || 'Error al actualizar la transacción.'
                this.showToast = true;
                console.error('Error al actualizar transacción ', err);
              }
            });
          return;
        }

        this.transactionService.createTransaction(transactionData)
          .subscribe({
            next: (data) => {
              this.fillBilling(data);
              this.toastType = typeToast.Success;
              this.messageToast = 'Registro insertado exitosamente.';
              this.showToast = true;
              setTimeout(() => {
                this.router.navigate(['/accounting/various-operations-list']);
              }, 2000);
            },
            error: (err) => {
              console.error('Error creating transaction:', err);
              this.toastType = typeToast.Error;
              this.messageToast = err.message || 'Error al crear la transacción.'
              this.showToast = true;
            },
          });

      } catch (error) {
        console.error('Error fetching journal by account type:', error);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al obtener el diario por tipo de cuenta.';
        this.showToast = true;
      }
    }
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        this.buttonTextPosting = 'Confirmando...';
        this.disablePosting = true;
        const transId = Number(this.id);
        this.transactionService.postTransaction(transId).subscribe({
          next: (data) => {
            this.toastType = typeToast.Success;
            this.messageToast = 'Transacción confirmada con éxito.!';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/accounting/various-operations-list']);
            }, 1500);


          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar publicar la transacción.';
            this.showToast = true;

            this.buttonTextPosting = 'Confirmar';
            this.disablePosting = false;
          },
        });

      }
    });
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

  enableEdit = () => {
    return this.variousOperations.status !== 'Success';
  };

  customCurrencyText(cellInfo: any): string {
    return cellInfo.valueText.replace('USD', '$').replace('HNL', 'L');
  }

  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false);
    const gridComponent = e.component;

    const totalDebit = gridComponent.getTotalSummaryValue('totalDebit');
    const totalCredit = gridComponent.getTotalSummaryValue('totalCredit');

    const rows = document.querySelectorAll('.dx-data-row');
  }

  private validate(): boolean {
    this.messageToast = '';
    this.showToast = false;
    if (this.dataSource.length < 2) {
      this.messageToast = 'Debe agregar al menos 2 transacciones para continuar.';
      this.showToast = true;
      this.toastType = typeToast.Error;
      return false;
    }
    const total = this.totalCredit - this.totalDebit;
    if (total !== 0) {
      this.messageToast =
        'El balance no es correcto, por favor ingrese los valores correctos.';
      this.showToast = true;
      this.toastType = typeToast.Error;
      return false;
    }
    const hasDuplicateAccountId = this.dataSource.some((item, index) => {
      return this.dataSource.filter(obj => obj.accountId === item.accountId).length > 1;
    });

    if (hasDuplicateAccountId) {
      this.messageToast =
        'No se puede registrar la misma cuenta en la transacción en el debe y en el haber.';
      this.showToast = true;
      this.toastType = typeToast.Error;

      return false;
    }

    return true;
  }

  private fillBilling(data: TransactionResponse): void {
    if (data.diaryType) {
      this.journalService.getJournalById(data.diaryType).subscribe({
        next: (journal: JournalModel) => {
          this.variousOperations.diaryType = journal.accountType;
          this.loadAccounts(this.variousOperations.diaryType);
        },
        error: (err) => {
          console.error('Error loading journal:', err);
        }
      });
    }

    this.dataSource = data.transactionDetails.map((item) => {
      return {
        accountId: item.accountId,
        amount: item.amount,
        id: item.id,
        movement: item.shortEntryType,
      } as Transaction;
    });

    this.variousOperations.id = data.id;
    this.variousOperations.currency = data.currency;
    this.variousOperations.status =
      data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
    this.variousOperations.billingNumber = data.reference;
    this.variousOperations.exchangeRate = data.exchangeRate;
    this.variousOperations.date = data.date;
    this.variousOperations.description = data.description;
    this.variousOperations.diaryType = this.variousOperations.diaryType

    this.variousOperations.typePayment = data.typeSale;
    this.variousOperations.methodPayment = data.typePayment
    this.variousOperations.rtn = data.rtn
    this.variousOperations.supplierName = data.supplierName

    this.allowAddEntry = data.status.toUpperCase() !== 'SUCCESS';


    const debe = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    const haber = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);
    this.totalCredit = debe;
    this.totalDebit = haber;

  }

  onChangeJournal(e: any) {

    if (e.target.value) {
      this.dataSource = [];
      this.loadAccounts();
    }
  }

  async react() {
    let dialogo = await confirm(`¿No existe un periodo activo desea activarlo?`, 'Advertencia');
    if (!dialogo) {
      window.history.back()
      return;
    }
    this.router.navigate(['/accounting/configuration/period']);
  }

  goBack() {
    window.history.back();
  }

  save(e: any) {
    this.updateAmounts();
  }

  update(e: any) {
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

  removed(e: any) {
    this.updateAmounts();
  }

  loadAccounts(selectedTypeId?: number) {
    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        this.accounts = data.filter(item => item.supportEntry);
        if (selectedTypeId !== undefined) {
          // Filtrar cuentas por tipo de cuenta que coincide con selectedTypeId
          this.accountList = this.accounts.filter(account => account.accountType === selectedTypeId)
            .map(item => ({
              id: item.id,
              description: item.name,
              code: item.accountCode
            } as AccountModel));
        } else {
          this.accountList = this.accounts.map(item => ({
            id: item.id,
            description: item.name,
            code: item.accountCode
          } as AccountModel));
        }
        if (this.accountList.length === 0) {
          this.toastType = typeToast.Warning;
          this.messageToast = 'No se encontraron cuentas para el tipo seleccionado.';
          this.showToast = true;
        }
      },
    });
  }

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };

  see(d: any) {
    console.log(d);
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

  onChangeType(e: any) {
    const selectedTypeId = Number(e.target.value);
    this.previousDiaryType = this.variousOperations.diaryType;

    // Verificar si el tipo de cuenta seleccionado tiene un diario creado
    this.journalService.getJournalByAccountType(selectedTypeId).subscribe({
      next: (journal) => {
        // Verificar si la respuesta contiene un diario
        if (journal && journal.id) {
          // Si hay diario asociado, proceder con el cambio
          if (this.dataSource.length > 0) {
            confirm(
              '¿Está seguro de que desea cambiar el tipo de operación? Esto eliminará todos los registros ingresados.',
              'Advertencia'
            ).then((result) => {
              if (result) {
                this.dataSource = [];
                this.totalDebit = 0;
                this.totalCredit = 0;
                this.variousOperations.description = '';
                this.variousOperations.diaryType = selectedTypeId;
                this.loadAccounts(selectedTypeId);
              } else {
                e.target.value = this.previousDiaryType;
                this.variousOperations.diaryType = this.previousDiaryType;
              }
            });
          } else {
            this.variousOperations.diaryType = selectedTypeId;
            this.variousOperations.description = '';
            this.totalDebit = 0;
            this.totalCredit = 0;
            this.loadAccounts(selectedTypeId);
          }
        } else {
          this.handleNoJournalAssociated(e);
        }
      },
      error: (err) => {
        console.error('Error fetching journal by account type:', err);
        this.handleApiError(e);
      }
    });
  }

  private handleNoJournalAssociated(e: any) {
    if (this.dataSource.length > 0) {
      confirm(
        'No hay diario creado para el tipo de operación seleccionado. ¿Desea continuar y perder los registros ingresados?',
        'Advertencia'
      ).then((result) => {
        if (result) {
          this.showToastMessage(typeToast.Error, 'No hay diario creado para el tipo de operación seleccionado.');
          this.clearData(e);
        } else {
          e.target.value = this.previousDiaryType;
          this.variousOperations.diaryType = this.previousDiaryType;
        }
      });
    } else {
      this.showToastMessage(typeToast.Error, 'No hay diario creado para el tipo de operación seleccionado.');
      this.clearData(e);
    }
  }

  private handleApiError(e: any) {
    if (this.dataSource.length > 0) {
      confirm(
        '¿Está seguro de que desea cambiar el tipo de operación? Esto eliminará todos los registros ingresados.',
        'Advertencia',
      ).then((result) => {
        if (result) {
          this.showToastMessage(typeToast.Warning, 'Debe de crear o activar un diario para el tipo de operación seleccionado, para poder continuar');
          this.clearData(e);
        } else {
          e.target.value = this.previousDiaryType;
          this.variousOperations.diaryType = this.previousDiaryType;
        }
      });
    } else {
      this.showToastMessage(typeToast.Warning, 'Debe de crear o activar un diario para el tipo de operación seleccionado, para poder continuar');
      this.clearData(e);
    }
  }

  private showToastMessage(type: ToastType, message: string) {
    this.toastType = type;
    this.messageToast = message;
    this.showToast = true;
  }

  private clearData(e: any) {
    this.accountList = [];
    this.dataSource = [];
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.variousOperations.description = '';
    this.variousOperations.diaryType = this.previousDiaryType;
    e.target.value = this.previousDiaryType;
  }
}
