import { Component, inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { confirm } from 'devextreme/ui/dialog';
import config from 'devextreme/core/config';
import {
  ProviderClient,
  IMovement,
  Transaction,
  typeToast,
} from '../../../models/models';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionModel } from '../../../models/TransactionModel';
import { AccountService } from '../../../services/account.service';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel } from '../../../models/AccountModel';
import { TransactionResponse } from 'src/app/modules/accounting/models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';

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
  providerBilling: ProviderClient = {
    billingNumber: '',
    date: new Date(),
    currency: '',
    exchangeRate: 0,
    description: '',
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

  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly periodService = inject(PeriodService);

  constructor() {
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => item.supportEntry && item.balances.length > 0)
          .map(item => ({
            id: item.id,
            description: item.name
          } as AccountModel));

      },
    });

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {
        this.transactionService.getTransactionById(findId).subscribe({
          next: (data) => this.fillBilling(data),
        });
      }else{
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
    console.log('valid? ', e.valid);
    if (e.valid && this.validate()) {

      let dialogo = await confirm(
        `¿Está seguro de que desea realizar esta acción?`,
        'Advertencia'
      );

      if (!dialogo) {
        return;
      }
      if (this.id) {
        //Cuando Actualiza la Factura de proveedores


      } else {

        const transactionData: TransactionModel = {
          createAtDate: this.providerBilling.date,
          reference: this.providerBilling.billingNumber,
          documentType: 2,
          exchangeRate: this.providerBilling.exchangeRate,
          descriptionPda: this.providerBilling.description,
          currency: this.providerBilling.currency,
          detail: this.dataSource.map((detail) => {
            return {
              accountId: detail.accountId,
              amount: detail.amount,
              motion: detail.movement,
            };
          }),
        };
        this.transactionService.createTransaction(transactionData).subscribe({
          next: (data) => {
            console.log({ data });
            this.providerBilling.id = data.id;
            this.providerBilling.status = 'Draft';
            this.toastType = typeToast.Success;
            this.messageToast = 'Registros insertados exitosamente';
            this.showToast = true;
          },
          error: (err) => console.error('error', err),
        });
      }



      //TODO: Laurent aqui hace la integración
      //el servicio deberia retornar el id de la transaccion y su estado
      //set id
      /*  const transactionData: TransactionModel = {
        createAtDate: this.providerBilling.date,
        reference: this.providerBilling.billingNumber,
        documentType: 1,
        exchangeRate: this.providerBilling.exchangeRate,
        descriptionPda: this.providerBilling.description,
        currency: this.providerBilling.currency,
        detail: this.dataSource.map((detail) => {
          return {
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          };
        }),
      };

      this.transactionService.createTransaction(transactionData).subscribe(
        (response: any) => {
          this.providerBilling.id = 1;
          this.providerBilling.status = 'Draft';
          this.toastType = typeToast.Success;
          this.messageToast = 'Registros insertados exitosamente';
          this.showToast = true;
        },
        (error: any) => {
          console.error('Error creating transaction:', error);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al crear la transacción';
          this.showToast = true;
        }
      ); */
    }
  }

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {

        this.buttonTextPosting = 'confirmando...';
        this.disablePosting = true;

        const transId = Number(this.id);
        this.transactionService.postTransaction(transId).subscribe({
          next: (data) => {
            this.router.navigate(['/accounting/provider-list']);
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar publicar la transacción';
            this.showToast = true;

            this.buttonTextPosting = 'Confirmar';
            this.disablePosting = false;
          },
        });

        this.router.navigate(['/accounting/client-list']);
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


  }

  async react() {
    let dialogo = await confirm(`¿No existe un periodo Activo desea activarlo?`, 'Advertencia');
    if (!dialogo) {
      window.history.back()
      return;
    }
    this.router.navigate(['/accounting/configuration/period']);
  }
}