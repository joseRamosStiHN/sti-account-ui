import { Component, inject, ViewChild } from '@angular/core';
import { NgForm, Validators } from '@angular/forms';
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
import { TransactionResponse } from '../../../models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { JournalModel } from 'src/app/modules/accounting/models/JournalModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent {

  allowAddEntry: boolean = true;
  id: string | null = null;
  totalCredit: number = 0;
  totalDebit: number = 0;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  buttonTextPosting: string = 'Confirmar';
  disablePosting: boolean = false;
  clientBilling: ClientBilling;
  dataSource: Transaction[] = [];

  journalList: JournalModel[] = [];
  selectedJournal?: JournalModel | null = null;

  editorOptions = {
    itemTemplate: 'accounts',
    searchEnabled: true,
    searchMode: 'contains',
    searchExpr: ['description', 'code'],
    onOpened: (e: any) => {
      const popupElement = e.component._popup.$content();
      const listItems = popupElement.find('.dx-list-item');
      this.selectedJournal = this.journalList.find(
        (journal) => journal.id === this.clientBilling.diaryType
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
    this.clientBilling = {
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

    this.journalService.getAllAccountingJournal().subscribe({
      next: (data) => {
        this.journalList = data
          .filter(item => item.accountTypeName === "Ingresos" && item.status == true);

        if (this.journalList.length > 0) {
          this.clientBilling.diaryType = this.journalList[0].id;
          this.loadAccounts();
        } else {
          this.toastType = typeToast.Error;
          this.messageToast = 'Debe de crear o activar un diario de ingresos para poder continuar.';
          this.showToast = true;
        }
      },

    })

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.clientBilling.id = Number(this.id);
      const findId = Number(this.id);
      if (findId) {
        this.transactionService.getTransactionById(findId).subscribe({
          next: (data) => this.fillBilling(data),
        }); const rows = document.querySelectorAll('.dx-data-row');
      } else {
        this.periodService.getStatusPeriod().subscribe({
          next: (status) => {
            if (!status) {
              this.react();
            }
          },
          error: (err) => this.router.navigate(['/accounting/client-list']),
        }
        );
      }
    });
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
      const transactionData: TransactionModel = {
        createAtDate: this.clientBilling.date,
        reference: this.clientBilling.billingNumber,
        documentType: 1,
        exchangeRate: this.clientBilling.exchangeRate,
        descriptionPda: this.clientBilling.description,
        currency: this.clientBilling.currency,
        diaryType: this.clientBilling.diaryType,
        typeSale: this.clientBilling.typePayment,
        typePayment: this.clientBilling.methodPayment,
        rtn: this.clientBilling.rtn,
        supplierName: this.clientBilling.supplierName,
        detail: this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
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

      //is an update
      if (this.id) {
        transactionData.id = Number(this.id);
        this.transactionService
          .updateTransaction(transactionData.id, transactionData)
          .subscribe({
            next: (data) => {
              this.fillBilling(data);
              this.toastType = typeToast.Success;
              this.messageToast = 'Registro Actualizado Exitosamente.';
              this.showToast = true;
              setTimeout(() => {
                this.router.navigate(['/accounting/client-list']);
              }, 2000);
            },
            error: (err) => {
              this.toastType = typeToast.Error;
              this.messageToast = err.message || 'Error al actualizar la transacción.'
              this.showToast = true;
              console.error('Error al actualizar transacción ', err);
            },
          });
        return;
      }

      this.transactionService.createTransaction(transactionData).subscribe({
        next: (data) => {
          this.fillBilling(data);
          this.toastType = typeToast.Success;
          this.messageToast = 'Registro insertado exitosamente.';
          this.showToast = true;
          setTimeout(() => {
            this.router.navigate(['/accounting/client-list']);
          }, 2000);
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.toastType = typeToast.Error;
          this.messageToast = err.message || 'Error al crear la transacción.'
          this.showToast = true;
        },
      });
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
              this.router.navigate(['/accounting/client-list']);
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
    return this.clientBilling.status !== 'Success';
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
    this.dataSource = data.transactionDetails.map((item) => {
      return {
        accountId: item.accountId,
        amount: item.amount,
        id: item.id,
        movement: item.shortEntryType,
      } as Transaction;
    });
    this.clientBilling.id = data.id;
    this.clientBilling.currency = data.currency;
    this.clientBilling.status =
      data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
    this.clientBilling.billingNumber = data.reference;
    this.clientBilling.exchangeRate = data.exchangeRate;
    this.clientBilling.date = data.date;
    this.clientBilling.description = data.description;
    this.clientBilling.diaryType = data.diaryType

    this.clientBilling.typePayment = data.typeSale;
    this.clientBilling.methodPayment = data.typePayment
    this.clientBilling.rtn = data.rtn
    this.clientBilling.supplierName = data.supplierName

    this.allowAddEntry = data.status.toUpperCase() !== 'SUCCESS';

    //this.loadAccounts();

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

  loadAccounts() {
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => {
            return item.supportEntry
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

  onCurrencyChange() {
    if (!this.itemForm || !this.itemForm.form) {
      return;
    }
    const exchangeRateControl = this.itemForm.form.get('exchangeRate');

    if (!exchangeRateControl) {
      return;
    }

    if (this.clientBilling.currency === 'USD') {
      exchangeRateControl.setValidators([Validators.required]);
    } else {
      exchangeRateControl.clearValidators();
    }
    exchangeRateControl.updateValueAndValidity();
  }

  onRtnChange() {
    if (!this.itemForm || !this.itemForm.form) {
      return;
    }
    const supplierNameControl = this.itemForm.form.get('supplierName');

    if (!supplierNameControl) {
      return;
    }

    if (this.clientBilling.rtn === 'SI') {
      supplierNameControl.setValidators([Validators.required]);
    } else {
      supplierNameControl.clearValidators();
    }
    supplierNameControl.updateValueAndValidity();
  }
}
