import { Component, inject, ViewChild } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { confirm } from 'devextreme/ui/dialog';
import config from 'devextreme/core/config';
import {
  ProviderClient,
  IMovement,
  Transaction,
  typeToast,
} from '../../../models/models';
import { NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionModel } from '../../../models/TransactionModel';
import { AccountService } from '../../../services/account.service';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel } from '../../../models/AccountModel';
import { TransactionResponse } from 'src/app/modules/accounting/models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrl: './provider.component.css',
})
export class ProviderComponent {
  totalCredit: number = 0;
  id: string | null = null;
  totalDebit: number = 0;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  buttonTextPosting: string = 'Confirmar';
  disablePosting: boolean = false;
  dataSource: Transaction[] = [];
  journalList: JournalModel[] = [];
  providerBilling: ProviderClient = {
    billingNumber: '',
    date: new Date(),
    currency: '',
    exchangeRate: 0,
    description: '',
    methodPayment: '',
    typePayment: '',
    rtn: '',
    supplierName: ''
  };

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
        (journal) => journal.id === this.providerBilling.diaryType
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
  private readonly transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly periodService = inject(PeriodService);
  private readonly journalService = inject(JournalService);

  constructor() {

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
          .filter(item => (item.accountTypeName === "Gastos" || item.accountTypeName === "Compras") && item.status == true);

        if (this.journalList.length > 0) {
          this.providerBilling.diaryType = this.journalList[0].id;
          this.loadAccounts();
        } else {
          this.toastType = typeToast.Error;
          this.messageToast = 'Debe de crear o activar un diario de compras para poder continuar.';
          this.showToast = true;
        }

      },
    })

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {
        this.transactionService.getTransactionById(findId).subscribe({
          next: (data) => this.fillBilling(data),
        });
      } else {
        //verifica que haya un periodo activo para poder crear partida
        this.periodService.getStatusPeriod().subscribe({
          next: (status) => {
            if (!status) {
              this.react();
            }
          },
          error: (err) => this.router.navigate(['/accounting/provider-list']),
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

        createAtDate: this.providerBilling.date,
        reference: this.providerBilling.billingNumber,
        documentType: 2,
        exchangeRate: this.providerBilling.exchangeRate,
        descriptionPda: this.providerBilling.description,
        currency: this.providerBilling.currency,
        diaryType: this.providerBilling.diaryType,
        typeSale: this.providerBilling.typePayment,
        typePayment: this.providerBilling.methodPayment,
        rtn: this.providerBilling.rtn,
        supplierName: this.providerBilling.supplierName,
        detail: this.dataSource.map((detail) => {
          return {
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          };
        }),
      }

      // console.log(transactionData);
      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );

      if (!dialogo) {
        return;
      }

      if (this.id) {
        //Cuando Actualiza la Factura de proveedores

        this.transactionService
          .updateTransaction(Number(this.id), transactionData)
          .subscribe({
            next: (data) => {
              this.fillBilling(data);
              this.toastType = typeToast.Success;
              this.messageToast = 'Registro Actualizado Exitosamente.';
              this.showToast = true;

              setTimeout(() => {
                this.router.navigate(['/accounting/provider-list']);
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

          this.providerBilling.id = data.id;
          this.providerBilling.status = 'Draft';
          this.toastType = typeToast.Success;
          this.messageToast = 'Registro insertado exitosamente.';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/accounting/provider-list']);
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
              this.router.navigate(['/accounting/provider-list']);
            }, 2000);

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
          } else if (
            // si es el item de credito y movimiento es el `HABER`
            options.name === 'totalCredit' &&
            options.value.movement === 'C'
          ) {
            options.totalValue += options.value.amount;
          }
          break;
      }
    }
  }

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
    this.providerBilling.id = data.id;
    this.providerBilling.currency = data.currency;
    this.providerBilling.status =
      data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
    this.providerBilling.billingNumber = data.reference;
    this.providerBilling.exchangeRate = data.exchangeRate;
    this.providerBilling.date = data.date;
    this.providerBilling.description = data.description;
    this.providerBilling.diaryType = data.diaryType;

    this.providerBilling.typePayment = data.typeSale;
    this.providerBilling.methodPayment = data.typePayment
    this.providerBilling.rtn = data.rtn
    this.providerBilling.supplierName = data.supplierName

    //this.loadAccounts();
    const debe = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    const haber = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);
    this.totalCredit = debe;
    this.totalDebit = haber;

    setTimeout(() => {
      this.onCurrencyChange();
      this.onRtnChange();
    });
  }

  onChangeJournal(e: any) {

    if (e.target.value) {
      this.dataSource = [];

      this.loadAccounts();
    }
  }

  async react() {
    let dialogo = await confirm(`¿No existe un periodo Activo desea activarlo?`, 'Advertencia');
    if (!dialogo) {
      window.history.back()
      return;
    }
    this.router.navigate(['/accounting/configuration/period']);
  }


  loadAccounts() {
    this.accountService.getAllAccountCached().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => item.supportEntry)
          .map(item => ({
            id: item.id,
            description: item.name,
            code: item.accountCode
          } as AccountModel));
      },
    });
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

  combineCodeAndDescription = (item: any) => {
    return item ? `${item.description} ${item.code}` : '';
  };


  goBack() {
    window.history.back();
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

    if (this.providerBilling.currency === 'USD') {
      exchangeRateControl.setValidators([Validators.required]);
    } else {
      exchangeRateControl.clearValidators();
      exchangeRateControl.setValue(null);
    }
    exchangeRateControl.updateValueAndValidity();
    exchangeRateControl.markAsTouched();
  }

  onRtnChange() {
    if (!this.itemForm || !this.itemForm.form) {
      return;
    }
    const supplierNameControl = this.itemForm.form.get('supplierName');

    if (!supplierNameControl) {
      return;
    }

    if (this.providerBilling.rtn === 'SI') {
      supplierNameControl.setValidators([Validators.required]);
    } else {
      supplierNameControl.clearValidators();
      supplierNameControl.setValue(null);
    }
    supplierNameControl.updateValueAndValidity();
    supplierNameControl.markAsTouched();
  }
}