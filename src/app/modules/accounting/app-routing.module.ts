import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountingPageComponent } from './pages/accounting-page/accounting-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { IncomeStatementComponent } from './components/reports/income-statement/income-statement.component';
import { GeneralBalanceComponent } from './components/reports/general-balance/general-balance.component';

import { ProviderComponent } from './pages/InvoiceProvider/provider/provider.component';
import { ProviderListComponent } from './pages/InvoiceProvider/provider-list/provider-list.component';
import { ClientListComponent } from './pages/InvoiceClient/client-list/client-list.component';
import { ClientComponent } from './pages/InvoiceClient/client/client.component';
import { ConfigurationComponent } from './pages/Accounts/configuration.component';
import { AccountComponent } from './pages/Accounts/create/account.component';
import { JournalListComponent } from 'src/app/modules/accounting/pages/journal-page/journal-list/journal-list.component';
import { JournalPageComponent } from 'src/app/modules/accounting/pages/journal-page/journal/journal-page.component';

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
      {
        path: 'configuration/accounts',
        component: ConfigurationComponent,
      },
      { path: 'report/general-balance', component: GeneralBalanceComponent },
      { path: 'report/incomes', component: IncomeStatementComponent },
      { path: 'journal-list', component: JournalListComponent },
      { path: 'journal/new-journal', component: JournalPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
