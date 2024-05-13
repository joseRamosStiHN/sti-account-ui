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
  ],
  providers: [ReportServiceService],
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
