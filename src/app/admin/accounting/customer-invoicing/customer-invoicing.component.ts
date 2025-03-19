import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import config from 'devextreme/core/config';
interface Transaction {
  accountId: number;
  amount: number;
  movement: string;
}

interface IAccount {
  code: string;
  name: string;
}

interface IMovement {
  name: string;
  code: string;
}

interface ClientBilling {
  id?: number;
  billingNumber: string;
  date: Date;
  currency: string;
  exchangeRate: number;
  description: string;
}

@Component({
  selector: 'app-customer-invoicing',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-invoicing.component.html',
  styleUrl: './customer-invoicing.component.css',
})
export class CustomerInvoicingComponent {
  totalCredit: number = 0;
  totalDebit: number = 0;
  invalidBalance: string = '';
  invalidNumberOfTx: string = '';
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
      code: '1',
      name: 'Cuentas por Cobrar',
    },
    {
      code: '2',
      name: 'Cuentas por pagar',
    },
  ];
  listMovement: IMovement[] = [
    {
      code: 'DEBE',
      name: 'Debe',
    },
    {
      code: 'HABER',
      name: 'Haber',
    },
  ];
  //
  constructor() {
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
    });
  }

  //submit request
  onSubmit(e: NgForm) {
    console.log('valid? ', e.valid);
    if (e.valid && this.validate()) {
      console.log('data:', this.clientBilling);
      console.log('dataSource', this.dataSource);
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
    this.invalidBalance = ''; // limpia el balance
    if (this.dataSource.length < 2) {
      // si el array contiene menos de 2 registros
      this.invalidNumberOfTx = 'Debe agregar al menos 2 transacciones';
      return false;
    }
    // operar sobre el total y verificar que lleve a cero la operación
    const total = this.totalCredit - this.totalDebit;
    if (total !== 0) {
      this.invalidBalance =
        'El balance no es correcto, por favor ingrese los valores correctos';
      return false;
    }
    // si todo `OK` retorna true
    return true;
  }
}
