import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountingPageComponent } from './pages/accounting-page/accounting-page.component';
import { ClientComponent } from './components/client/client.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { ClientListComponent } from './components/client-list/client-list.component';
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
import { ProviderComponent } from './components/provider/provider.component';
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';

import { AccountComponent } from './components/configuration/account/account.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AccountingPageComponent,
    ClientComponent,
    DashboardComponent,
    ClientListComponent,
    ProviderComponent,
    ProviderListComponent,
    ConfigurationComponent,
    GeneralBalanceComponent,
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
