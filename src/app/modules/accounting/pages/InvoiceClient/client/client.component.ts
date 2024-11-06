import { AfterViewInit, Component, ElementRef, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DxDataGridComponent, DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
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
import { JournalModel, JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { Observable } from 'rxjs';

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

  //
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
      typePayment:'',
      methodPayment:'',
      rtn:'',
      supplierName:''
    };

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
          .filter(item => item.accountType == JournalTypes.Ventas && item.status);

        // console.log(this.journalList);

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
    if (e.valid && this.validate()) {
      const transactionData: TransactionModel = {
        createAtDate: this.clientBilling.date,
        reference: this.clientBilling.billingNumber,
        documentType: 1,
        exchangeRate: this.clientBilling.exchangeRate,
        descriptionPda: this.clientBilling.description,
        currency: this.clientBilling.currency,
        diaryType: this.clientBilling.diaryType,
        typeSale:this.clientBilling.typePayment,
        typePayment:this.clientBilling.methodPayment,
        rtn:this.clientBilling.rtn,
        supplierName:this.clientBilling.supplierName,
        detail: this.dataSource.map((detail) => {
          return {
            id: detail.id,
            accountId: detail.accountId,
            amount: detail.amount,
            motion: detail.movement,
          };
        }),
      };


      console.log(transactionData);

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
              this.messageToast = 'Actualizados Exitosamente';
              this.showToast = true;
              setTimeout(() => {
                this.router.navigate(['/accounting/client-list']);
              }, 2000);
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
          setTimeout(() => {
            this.router.navigate(['/accounting/client-list']);
          }, 2000);
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
            this.toastType = typeToast.Success;
            this.messageToast = 'Transacción publicada con exito';
            this.showToast = true;
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
    // this.totalDebit = totalDebit; // actualiza en la vista
    // this.totalCredit = totalCredit;

    const rows = document.querySelectorAll('.dx-data-row');
    // rows.forEach(row => {
    //   const tds = row.querySelectorAll("td");
    //   tds.forEach(td => {
    //     const codeAccount = td.textContent
    //     if (codeAccount == 'Haber') {
    //       const editButtons = row.querySelectorAll(".dx-link-edit");
    //       const deleteButtons = row.querySelectorAll(".dx-link-delete");
    //       editButtons.forEach(button => {
    //         (button as HTMLElement).style.display = 'none'; // Type assertion para HTMLElement
    //       });

    //       deleteButtons.forEach(button => {
    //         (button as HTMLElement).style.display = 'none'; // Type assertion para HTMLElement
    //       });
    //     }
    //   })
    // });

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

    this.clientBilling.typePayment= data.typeSale;
    this.clientBilling.methodPayment= data.typePayment
    this.clientBilling.rtn= data.rtn
    this.clientBilling.supplierName= data.supplierName
    //
    this.allowAddEntry = data.status.toUpperCase() !== 'SUCCESS';

    this.loadAccounts();

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
    let dialogo = await confirm(`¿No existe un periodo Activo desea activarlo?`, 'Advertencia');
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


    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'C' && debit.length <= 1) {
      if (debit.length == 1) {
        debit.forEach((item) => {
          const sum = credit.reduce((total, currentItem) => total + currentItem.amount, 0);

          const roundedSum = parseFloat(sum.toFixed(2));

         item.amount = roundedSum;
        });

      } else {

        this.dataSource.push({
          id: this.selectedJournal?.id ?? 0,
          accountId: this.selectedJournal?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),
          movement: 'D',

        });
      }

    }

    if (e.data.movement == 'D' && credit.length <= 1) {

      if (credit.length == 1) {
        credit.forEach((item) => {
          const sum = debit.reduce((total, currentItem) => total + currentItem.amount, 0);
  
          // Redondear la suma a dos decimales para asegurar precisión
          const roundedSum = parseFloat(sum.toFixed(2));

          item.amount = roundedSum
        });

      } else {

        this.dataSource.push({
          id: this.selectedJournal?.id ?? 0,
          accountId: this.selectedJournal?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),
          movement: 'C',

        });
      }

    }

    this.updateAmounts();





    // let foundItems = this.dataSource.filter((data) => data.movement === 'D');
    // console.log(foundItems.length);

    // console.log("afuera");
    // if (foundItems.length = 0) {
    //   console.log("aqui entro");

    //   foundItems.forEach((item) => {
    //     const sum = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    //     item.amount = sum
    //   });
    // } else {

    //   this.totalCredit = e.data.amount;
    //   this.totalDebit = e.data.amount;

    //   this.dataSource.push({
    //     id: this.selectedJournal?.id ?? 0,
    //     accountId: this.selectedJournal?.defaultAccount ?? 0,
    //     amount: e.data.amount,
    //     movement: 'C',

    //   });
    // }
  }

  private updateAmounts(): void {


    if (this.dataSource.length > 0) {
      // Calcular el total de los movimientos 'D' (debe)
      const debe = this.dataSource
        .filter((data) => data.movement === 'D')
        .reduce((sum, item) => sum + item.amount, 0);
    
      // Calcular el total de los movimientos 'C' (haber)
      const haber = this.dataSource
        .filter((data) => data.movement === 'C')
        .reduce((sum, item) => sum + item.amount, 0);
    
      // Redondear los totales a dos decimales
      this.totalCredit = parseFloat(haber.toFixed(2));
      this.totalDebit = parseFloat(debe.toFixed(2));
    
      // Mostrar en la consola para verificar
      // console.log('Total Debit:', this.totalDebit);
      // console.log('Total Credit:', this.totalCredit);
    }
  }

  update(e: any) {
    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'D' && credit.length == 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }
    if (e.data.movement == 'C' && debit.length == 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2));
      });
    }



    this.updateAmounts();

    // let foundItems = this.dataSource.filter((data) => data.movement === 'C');
    // if (foundItems.length > 0) {
    //   foundItems.forEach((item) => {
    //     const sum = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    //     this.totalCredit = sum;
    //     this.totalDebit = sum;
    //     item.amount = sum
    //   });
    // }


  }

  removed(e: any) {

    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');

    if (e.data.movement == 'D' && credit.length == 1 && debit.length == 0) {
      this.dataSource = [];
      return;
    }
    if (e.data.movement == 'C' && debit.length == 1 && credit.length == 0) {
      this.dataSource = [];
      return
    }

    if (e.data.movement == 'D' && credit.length == 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, item) => sum + item.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); 
      });
    }
    if (e.data.movement == 'C' && debit.length == 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, item) => sum + item.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); 
      });
    }

    this.updateAmounts();


    // let debitos = this.dataSource.filter((data) => data.movement === 'D');
    // if (debitos.length > 0) {
    //   let foundItems = this.dataSource.filter((data) => data.movement === 'C');
    //   foundItems.forEach((item) => {
    //     const sum = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    //     this.totalCredit = sum;
    //     this.totalDebit = sum;
    //     item.amount = sum
    //   });
    // } else {
    //   this.dataSource = [];
    //   this.totalCredit = 0;
    //   this.totalDebit = 0;
    // }
  }

  loadAccounts() {
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => {   
            return item.supportEntry && item.balances.length > 0})
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


}
