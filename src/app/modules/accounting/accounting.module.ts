import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountingPageComponent } from './pages/accounting-page/accounting-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDateRangeBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTemplateModule,
  DxPivotGridModule,
  DxToastModule,
  DxTreeListModule,
} from 'devextreme-angular';

import { HttpClientModule } from '@angular/common/http';
import { ReportServiceService } from './services/report-service.service';
import { GeneralBalanceComponent } from './components/reports/general-balance/general-balance.component';
import { IncomeStatementComponent } from './components/reports/income-statement/income-statement.component';
import { ConfigurationAccountComponent } from './components/configuration-account/configuration-account.component';

import { ProviderListComponent } from './pages/InvoiceProvider/provider-list/provider-list.component';
import { ProviderComponent } from './pages/InvoiceProvider/provider/provider.component';
import { ClientListComponent } from './pages/InvoiceClient/client-list/client-list.component';
import { ClientComponent } from './pages/InvoiceClient/client/client.component';
import { ConfigurationComponent } from './pages/Accounts/configuration.component';
import { AccountComponent } from './pages/Accounts/create/account.component';
import { CardAccountingComponent } from './components/card-accounting/card-accounting.component';
import { JournalPageComponent } from './pages/journal-page/journal/journal-page.component';
import { JournalListComponent } from './pages/journal-page/journal-list/journal-list.component';
import { showControlDirective } from 'src/app/shared/directives/showControlDirective';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { PeriodListComponent } from './pages/period-page/period-list/period-list.component';
import { PeriodComponent } from './pages/period-page/period/period.component';
import { BalanceListComponent } from './pages/balance-accounts/balance-list/balance-list.component';
import { BalanceAccountsComponent } from './pages/balance-accounts/balance-accounts/balance-accounts.component';
import { SeniorAccountantsComponent } from 'src/app/modules/accounting/pages/senior-accountants/senior-accountants.component';

@NgModule({
  declarations: [
    AccountingPageComponent,
    ClientComponent,
    ClientListComponent,
    DashboardComponent,
    ProviderComponent,
    ProviderListComponent,
    ConfigurationComponent,
    GeneralBalanceComponent,
    IncomeStatementComponent,
    ConfigurationAccountComponent,
    AccountComponent,
    CardAccountingComponent,
    JournalPageComponent,
    JournalListComponent,
    showControlDirective,
    PeriodListComponent,
    PeriodComponent,
    BalanceListComponent,
    BalanceAccountsComponent,
    SeniorAccountantsComponent
  ],
  providers: [ReportServiceService,
    JournalService
  ],
  exports: [AccountingPageComponent, HttpClientModule],
  imports: [
    CommonModule,
    AppRoutingModule,
    RouterModule,
    DxDataGridModule,
    DxTreeListModule,
    DxPivotGridModule,
    DxToastModule,
    DxDateRangeBoxModule,
    DxButtonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxPopupModule,
    DxButtonModule,
    DxTemplateModule,
  ],
})
export class AccountingModule {}
