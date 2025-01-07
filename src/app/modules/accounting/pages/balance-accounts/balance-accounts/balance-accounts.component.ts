import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { AccountModel, BalancesModel } from 'src/app/modules/accounting/models/AccountModel';
import { AccountAPIResponse } from 'src/app/modules/accounting/models/APIModels';
import { BalanceResponse } from 'src/app/modules/accounting/models/BalancesModel';
import { IMovement, typeToast } from 'src/app/modules/accounting/models/models';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { BalancesAccountsService } from 'src/app/modules/accounting/services/balances-accounts.service';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { confirm } from 'devextreme/ui/dialog';


export class State {
  ID!: number;
  Name!: string;
}

interface accountSummary{
  name:string
  code:string
  typeAccount:string,
  fatherAccount:string
}

@Component({
  selector: 'app-balance-accounts',
  templateUrl: './balance-accounts.component.html',
  styleUrl: './balance-accounts.component.css'
})
export class BalanceAccountsComponent {

  @Input('id') id?: string;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  sumaryAccount:accountSummary={
    code:"",
    name:"",
    fatherAccount:"",
    typeAccount:""
  }



  accountPrefix: string = '';

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
  private readonly periodService = inject(PeriodService);

  constructor() {
    this.listMovement = ['Debito', 'Credito'];
  }

  ngOnInit(): void {
    this.activeAdd = false;
    this.activeEdit = false;

    this.periodService.getStatusPeriod().subscribe({
      next: (status) => {
        if (!status) {
          this.react();
        }
      },
      error: (err) => console.error('error: we got ', err),
    }
    );


    const findId = Number(this.id);
    if (findId) {
      this.accountService.findAccountById(findId).subscribe({
        next: (data) => this.fillForm(data),
        error: (err) => console.error('error: we got ', err),
      });
    }


  }

  save(e: any) {
    e.data.isCurrent = true;

    let balanceSave: BalancesModel = {
      createAtDate: new Date(),
      isCurrent: true,
      initialBalance: e.data.initialBalance,
      typicalBalance: e.data.typicalBalance == "Debito" ? "D" : "C",
      accountId: Number(this.id)
    }

    this.balanceService.saveBalance(balanceSave).subscribe({
      next: (data) => {

        this.activeAdd = false
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros inicialisados exitosamente';
        this.showToast = true;
        this.activeEdit = true;
        this.redirectTo();

      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al inicializar saldos';
        this.showToast = true;
        this.redirectTo();
      },
    });


  }


  update(e: any) {

    let balance: BalancesModel = {
      createAtDate: e.data.createAtDate,
      isCurrent: true,
      initialBalance: e.data.initialBalance,
      typicalBalance: e.data.typicalBalance == "Debito" ? "D" : "C",
      accountId: Number(this.id)
    }

    this.balanceService.updateBalance(Number(e.data.id), balance).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros actualizados exitosamente';
        this.showToast = true;
        this.redirectTo();
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo';
        this.showToast = true;
        this.redirectTo();
      },
    });


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


    this.accountForm.balances = data.balances.map((balance) => {
      return {
        ...balance,
        typicalBalance: balance.typicalBalance === "D" ? "Debito" : "Credito"
      };
    });

    if (this.accountForm.balances.length < 1) {
      this.activeAdd = true;
    }

    if (this.accountForm.balances.length == 1) {
      this.activeEdit = true;
    }

    this.sumaryAccount=  {
      name: data.name,
      code: data.accountCode,
      fatherAccount: data.parentName?? '',
      typeAccount: data.categoryName,
    };

  }

  async react() {

    let dialogo = await confirm(`¿No existe un periodo Activo desea activarlo?`, 'Advertencia');
    if (!dialogo) {
      window.history.back()
      return;
    }

    this.router.navigate(['/accounting/configuration/period']);
  }

  redirectTo() {
    setTimeout(() => {
      this.router.navigate(['/accounting/configuration/balance/accounts']);
    }, 3000);
  }
}
