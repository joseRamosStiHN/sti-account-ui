import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientComponent } from './components/client/client.component';
import { AccountingPageComponent } from './pages/accounting-page/accounting-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ProviderComponent } from './components/provider/provider.component';
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { GeneralBalanceComponent } from './components/reports/general-balance/general-balance.component';
import { AccountComponent } from './components/configuration/account/account.component';
import { IncomeStatementComponent } from './components/reports/income-statement/income-statement.component';

const routes: Routes = [
  {
    path: '',
    component: AccountingPageComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'client-invoicing', component: ClientComponent },
      { path: 'client-invoicing/:id', component: ClientComponent },
      { path: 'client-list', component: ClientListComponent },
      { path: 'provider-invoicing', component: ProviderComponent },
      { path: 'provider-invoicing/:id', component: ProviderComponent },
      { path: 'provider-list', component: ProviderListComponent },
      { path: 'configuration', component: ConfigurationComponent },
      { path: 'configuration/new-account', component: AccountComponent },
      {
        path: 'configuration/update-account/:id',
        component: AccountComponent,
      },
      { path: 'reports', component: GeneralBalanceComponent },
      { path: 'reports/incomes', component: IncomeStatementComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
