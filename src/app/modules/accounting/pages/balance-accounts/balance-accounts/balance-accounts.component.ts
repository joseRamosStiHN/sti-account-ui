import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel, BalancesModel } from 'src/app/modules/accounting/models/AccountModel';
import { AccountAPIResponse } from 'src/app/modules/accounting/models/APIModels';
import { BalanceResponse } from 'src/app/modules/accounting/models/BalancesModel';
import { IMovement, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { BalancesAccountsService } from 'src/app/modules/accounting/services/balances-accounts.service';


export class State {
  ID!: number;
  Name!: string;
}

@Component({
  selector: 'app-balance-accounts',
  templateUrl: './balance-accounts.component.html',
  styleUrl: './balance-accounts.component.css'
})
export class BalanceAccountsComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;



  accountPrefix: string = '';
  id: string | null = null;
  balanceResponse!: BalanceResponse[];
  activeAdd!: boolean;
  activeEdit!: boolean;

  listMovement: any;


  accountForm: AccountModel = {
    description: '',
    code: '',
    status: 'ACTIVO',
    balances: [],
  };

  private readonly router = inject(Router);
  private readonly activeRouter = inject(ActivatedRoute);
  private readonly accountService = inject(AccountService);
  private readonly balanceService = inject(BalancesAccountsService);


  constructor() {
    this.listMovement = ['Debito', 'Credito'];
  }

  ngOnInit(): void {
    this.activeAdd =false;
    this.activeEdit =false;

    this.activeRouter.paramMap.subscribe((params) => {
      this.id = params.get('id');
      const findId = Number(this.id);
      if (findId) {
        this.accountService.findAccountById(findId).subscribe({
          next: (data) => this.fillForm(data),
          error: (err) => console.error('error: we got ', err),
        });
      }
    });

  }

  save(e: any) {
    e.data.isCurrent = true;

    let balanceSave: BalancesModel = {
      createAtDate: new Date(),
      isActual: true,
      initialBalance: e.data.initialBalance,
      typicalBalance: e.data.typicalBalance,
      accountId: Number(this.id)
    }

    this.balanceService.saveBalance(balanceSave).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros inicialisados exitosamente';
        this.showToast = true;
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al inicializar saldos';
        this.showToast = true;
      },
    });
 

  }


  update(e: any){

    console.log(e.data);
    
    let balance: BalancesModel = {

      createAtDate: e.data.createAtDate,
      isActual: true,
      initialBalance: e.data.initialBalance,
      typicalBalance: e.data.typicalBalance,
      accountId: Number(this.id)
    }

    

    this.balanceService.updateBalance(Number(e.data.id), balance).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros actualizados exitosamente';
        this.showToast = true;
        setTimeout(() => {
      
        }, 1000);
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo';
        this.showToast = true;
      },
    });

    setTimeout(() => {
      this.ngOnInit();
    }, 1000);

   
  }

  private fillForm(data: AccountAPIResponse): void {
    this.accountForm.id = data.id;
    this.accountForm.category = data.categoryId;
    this.accountForm.code = data.accountCode;
    this.accountForm.description = data.name;
    if (data.typicallyBalance.toUpperCase() === 'CREDITO') {
      this.accountForm.typicalBalance = 'C';
    } else {
      this.accountForm.typicalBalance = 'D';
    }
    this.accountForm.supportsRegistration = data.supportEntry;
    this.accountForm.parentId = data.parentId;
    this.accountPrefix = data.parentCode ?? '';
    this.accountForm.isActive =
      data.status.toUpperCase() === 'ACTIVA' ? true : false;
    this.accountForm.balances = data.balances;

    if (this.accountForm.balances.length < 1) {
      this.activeAdd = true;
    }

    if (this.accountForm.balances.length == 1) {
      this.activeEdit = true;
    }

  }
}
