import { Component, inject } from '@angular/core';
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
import { TransactionResponse } from '../../../models/APIModels';

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

  //
  private readonly router = inject(Router);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly transactionService = inject(TransactionService);
  private readonly accountService = inject(AccountService);

  constructor() {
    this.clientBilling = {
      billingNumber: '',
      date: new Date(),
      currency: '',
      exchangeRate: 0,
      description: '',
    };
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data.map((item) => {
          return { id: item.id, description: item.name } as AccountModel;
        });
      },
    });

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.clientBilling.id = Number(this.id);
      const findId = Number(this.id);
      if (findId) {
        this.transactionService.getTransactionById(findId).subscribe({
          next: (data) => this.fillBilling(data),
        });
      }
    });
  }

  onSubmit(e: NgForm) {
    if (e.valid && this.validate()) {
      const transactionData: TransactionModel = {
        createAtDate: this.clientBilling.date,
        reference: this.clientBilling.billingNumber,
        documentType: 1,
        exchangeRate: this.clientBilling.exchangeRate,
        descriptionPda: this.clientBilling.description,
        currency: this.clientBilling.currency,
        detail: this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          };
        }),
      };

      //is an update
      if (this.id) {
        transactionData.id = Number(this.id);
        this.transactionService
          .updateTransaction(transactionData.id, transactionData)
          .subscribe({
            next: (data) => {
              this.fillBilling(data);
              this.toastType = typeToast.Success;
              this.messageToast = 'Actualizados Exitosamente';
            },
            error: (err) => {
              this.toastType = typeToast.Error;
              this.messageToast = 'No se pudo Actualizar los datos';
              this.showToast = true;
              console.error('erro al actualizar transacción ', err);
            },
          });
        return;
      }

      this.transactionService.createTransaction(transactionData).subscribe({
        next: (data) => {
          this.fillBilling(data);
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

  posting() {
    let dialogo = confirm(
      `¿Está seguro de que desea realizar esta acción?`,
      'Advertencia'
    );

    dialogo.then(async (d) => {
      if (d) {
        // si el usuario dio OK
        this.buttonTextPosting = 'confirmando...';
        this.disablePosting = true;
        const transId = Number(this.id);
        this.transactionService.postTransaction(transId).subscribe({
          next: (data) => {
            this.router.navigate(['/accounting/client-list']);
          },
          error: (err) => {
            this.toastType = typeToast.Error;
            this.messageToast = 'Error al intentar publicar la transacción';
            this.showToast = true;

            this.buttonTextPosting = 'Confirmar';
            this.disablePosting = false;
          },
        });
        //TODO: Laurent
        /*
          aqui cuando el usuario le dio confirma debe de llamar al api
          debe de enviar el estado al que va a cambiar que seria POST(o el que ponga Edwin)
          y el id de la transacción
          si todo va bien lo vamos a enviar a otra sección
          en caso de error usar:
               this.toastType = typeToast.Error;
               this.messageToast = '<Aqui va el mensaje de error>'; 
               this.showToast = true;

                this.buttonTextPosting = 'Confirmar';
                this.disablePosting = false;
    
        */
        //si todo fue OK redirigir al usuario
        //this.router.navigate(['/accounting/client-list']);
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

    //
    this.allowAddEntry = data.status.toUpperCase() !== 'SUCCESS';
  }
}
