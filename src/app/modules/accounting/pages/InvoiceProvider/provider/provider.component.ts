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
    methodPayment:'',
    typePayment:'',
    rtn:'',
    supplierName:''
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

  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly periodService = inject(PeriodService);
  private readonly journalService = inject(JournalService);

  constructor() {
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
          .filter(item => item.accountType == JournalTypes.Compras && item.status);
      },
    })

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
   
    if (e.valid && this.validate()) {

     


      const transactionData: TransactionModel = {
          
        createAtDate: this.providerBilling.date,
        reference: this.providerBilling.billingNumber,
        documentType: 2,
        exchangeRate: this.providerBilling.exchangeRate,
        descriptionPda: this.providerBilling.description,
        currency: this.providerBilling.currency,
        diaryType:this.providerBilling.diaryType,
        typeSale:this.providerBilling.typePayment,
        typePayment:this.providerBilling.methodPayment,
        rtn:this.providerBilling.rtn,
        supplierName:this.providerBilling.supplierName,
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
              this.messageToast = 'Actualizados Exitosamente';
              this.showToast = true;

              setTimeout(() => {
                this.router.navigate(['/accounting/provider-list']); 
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
          
            this.providerBilling.id = data.id;
            this.providerBilling.status = 'Draft';
            this.toastType = typeToast.Success;
            this.messageToast = 'Registros insertados exitosamente';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/accounting/provider-list']); 
            }, 2000);
          },
          error: (err) => console.error('error', err),
        });
      



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
            this.toastType = typeToast.Success;
            this.messageToast = 'Transacción publicada con exito';
            this.showToast = true;
            setTimeout(() => {
              this.router.navigate(['/accounting/provider-list']); 
            }, 2000);
        
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


    // const rows = document.querySelectorAll('.dx-data-row');
    // rows.forEach(row => {
    //   const tds = row.querySelectorAll("td");
    //   tds.forEach(td => {
    //     const codeAccount = td.textContent
    //     if (codeAccount == 'Debe') {
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
      return false;
    }
    // operar sobre el total y verificar que lleve a cero la operación
    const total = this.totalCredit - this.totalDebit;
    // console.log(total);
    
    if (total !== 0) {
      this.messageToast =
        'El balance no es correcto, por favor ingrese los valores correctos';
      this.showToast = true;
      this.toastType = typeToast.Error;
      //console.log('invalida balance');
      return false;
    }

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
    this.providerBilling.diaryType= data.diaryType;

    this.providerBilling.typePayment= data.typeSale;
    this.providerBilling.methodPayment= data.typePayment
    this.providerBilling.rtn= data.rtn
    this.providerBilling.supplierName= data.supplierName

    this.loadAccounts();
    const debe = this.dataSource.filter((data) => data.movement === 'D').reduce((sum, item) => sum + item.amount, 0);
    const haber = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);
    this.totalCredit = debe;
    this.totalDebit = haber;
  }

  async react() {
    let dialogo = await confirm(`¿No existe un periodo Activo desea activarlo?`, 'Advertencia');
    if (!dialogo) {
      window.history.back()
      return;
    }
    this.router.navigate(['/accounting/configuration/period']);
  }

  onChangeJournal(e: any) {

    if (e.target.value) {
      this.dataSource = [];
   
     this.loadAccounts();
    }
  }

  loadAccounts(){
    this.accountService.getAllAccount().subscribe({
      next: (data) => {
        this.accountList = data
          .filter(item => item.supportEntry )
          .map(item => ({
            id: item.id,
            description: item.name,
            code: item.accountCode
          } as AccountModel));
      },
    });
  }
  save(e: any) {

    const credit = this.dataSource.filter((data) => data.movement === 'C');
    const debit = this.dataSource.filter((data) => data.movement === 'D');
  
    // console.log("credit", credit);
    // console.log("debit", debit);
  
    if (e.data.movement === 'C' && debit.length <= 1) {
      if (debit.length === 1) {
        debit.forEach((item) => {
          // Sumar el monto de los movimientos 'C'
          const sum = credit.reduce((total, currentItem) => total + currentItem.amount, 0);
          
          // Redondear la suma a dos decimales para asegurar precisión
          const roundedSum = parseFloat(sum.toFixed(2));
  
          // Asignar el valor redondeado
          // console.log('Suma calculada para movimiento C (redondeada):', roundedSum);
          item.amount = roundedSum;  // Redondear a dos decimales
        });
      } else {
        // Si no hay debit, agregarlo automáticamente
        this.dataSource.push({
          id: this.selectedJournal?.id ?? 0,
          accountId: this.selectedJournal?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),  // Aseguramos precisión al agregar el valor
          movement: 'D',
        });
      }
    }
  
    if (e.data.movement === 'D' && credit.length <= 1) {
      if (credit.length === 1) {
        credit.forEach((item) => {
          // Sumar el monto de los movimientos 'D'
          const sum = debit.reduce((total, currentItem) => total + currentItem.amount, 0);
  
          // Redondear la suma a dos decimales para asegurar precisión
          const roundedSum = parseFloat(sum.toFixed(2));
  
          // Asignar el valor redondeado
          // console.log('Suma calculada para movimiento D (redondeada):', roundedSum);
          item.amount = roundedSum;  // Redondear a dos decimales
        });
      } else {
        // Si no hay credit, agregarlo automáticamente
        this.dataSource.push({
          id: this.selectedJournal?.id ?? 0,
          accountId: this.selectedJournal?.defaultAccount ?? 0,
          amount: parseFloat(e.data.amount.toFixed(2)),  // Aseguramos precisión al agregar el valor
          movement: 'C',
        });
      }
    }
  
    this.updateAmounts();





    // e.data.movement = "C";
    // let foundItems = this.dataSource.filter((data) => data.movement === 'D');
    // if (foundItems.length > 0) {

    //   foundItems.forEach((item) => {
    //     const sum = this.dataSource.filter((data) => data.movement === 'C').reduce((sum, item) => sum + item.amount, 0);

    //     this.totalCredit = sum;
    //     this.totalDebit = sum;

    //     item.amount = sum
    //   });
    // } else {

    //   this.totalCredit = e.data.amount;
    //   this.totalDebit = e.data.amount;

    //   this.dataSource.push({
    //     id: this.selectedJournal?.id ?? 0,
    //     accountId: this.selectedJournal?.defaultAccount ?? 0,
    //     amount: e.data.amount,
    //     movement: 'D',

    //   });


      // setTimeout(() => {
      //   const rows = document.querySelectorAll('.dx-data-row');

      //   rows.forEach(row => {
      //     const tds = row.querySelectorAll("td");
      //     tds.forEach(td => {
      //       const codeAccount = td.textContent
      //       if (codeAccount == 'Debe') {
      //         const editButtons = row.querySelectorAll(".dx-link-edit");
      //         const deleteButtons = row.querySelectorAll(".dx-link-delete");
      //         editButtons.forEach(button => {
      //           (button as HTMLElement).style.display = 'none';
      //         });

      //         deleteButtons.forEach(button => {
      //           (button as HTMLElement).style.display = 'none'; 
      //         });
      //       }
      //     })
      //   });
      // }, 2);
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
  
    if (e.data.movement === 'D' && credit.length === 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); // Redondear a dos decimales
        // console.log('Nuevo monto para crédito:', item.amount); // Mostrar en consola
      });
    }
  
    if (e.data.movement === 'C' && debit.length === 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); // Redondear a dos decimales
        // console.log('Nuevo monto para débito:', item.amount); // Mostrar en consola
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
  
    // Eliminar todos los registros si hay uno de cada tipo y ninguno más
    if (e.data.movement === 'D' && credit.length === 1 && debit.length === 0) {
      this.dataSource = [];
      return;
    }
    if (e.data.movement === 'C' && debit.length === 1 && credit.length === 0) {
      this.dataSource = [];
      return;
    }
  
    // Actualizar el monto del movimiento de crédito
    if (e.data.movement === 'D' && credit.length === 1) {
      credit.forEach((item) => {
        const sum = debit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); // Redondear a dos decimales
      });
    }
  
    // Actualizar el monto del movimiento de débito
    if (e.data.movement === 'C' && debit.length === 1) {
      debit.forEach((item) => {
        const sum = credit.reduce((sum, currentItem) => sum + currentItem.amount, 0);
        item.amount = parseFloat(sum.toFixed(2)); // Redondear a dos decimales
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
}