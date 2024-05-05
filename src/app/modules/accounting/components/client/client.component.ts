import { Component, inject, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import config from 'devextreme/core/config';
import { confirm } from 'devextreme/ui/dialog';
import {
  ClientBilling,
  IAccount,
  IMovement,
  Transaction,
  typeToast,
} from '../models/models';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { TransactionModel } from '../models/TransactionModel';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent {
  totalCredit: number = 0;
  totalDebit: number = 0;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: string = typeToast.Info;
  buttonTextPosting: string = 'Confirmar';
  disablePosting: boolean = false;
  clientBilling: ClientBilling = {
    billingNumber: '',
    date: new Date(),
    currency: '',
    exchangeRate: 0,
    description: '',
  };
  dataSource: Transaction[] = [];
  listAccount: IAccount[] = [
    {
      code: '16',
      name: 'Cuentas por Cobrar',
    },
    {
      code: '16',
      name: 'Cuentas por pagar',
    },
  ];
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
  //
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);

  constructor() {
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  onSubmit(e: NgForm) {
    console.log('valid? ', e.valid);
    if (e.valid && this.validate()) {
      console.log('data:', this.clientBilling);
      console.log('dataSource', this.dataSource);
      //TODO: Laurent aqui hace la integración
      //el servicio deberia retornar el id de la transaccion y su estado
      //set id
      const transactionData: TransactionModel = {
        createAtDate: this.clientBilling.date,
        reference: this.clientBilling.billingNumber,
        documentType: 1,
        exchangeRate: this.clientBilling.exchangeRate,
        descriptionPda: this.clientBilling.description,
        currency: this.clientBilling.currency,
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
          this.clientBilling.id = 1;
          this.clientBilling.status = 'Draft';
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
      );
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
          if (
            options.name === 'totalDebit' &&
            options.value.movimiento === 'DEBE'
          ) {
            // si es el item de debito y el movimiento el `DEBE`
            options.totalValue += options.value.monto;
          } else if (
            // si es el item de credito y movimiento es el `HABER`
            options.name === 'totalCredit' &&
            options.value.movimiento === 'HABER'
          ) {
            options.totalValue += options.value.monto;
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
}
