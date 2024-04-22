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
  DxDateRangeBoxModule,
  DxToastModule,
} from 'devextreme-angular';
import { ProviderComponent } from './components/provider/provider.component';
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { GeneralBalanceComponent } from './components/reports/general-balance/general-balance.component';
import { AccountComponent } from './components/configuration/account/account.component';

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
  exports: [AccountingPageComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    RouterModule,
    DxDataGridModule,
    DxToastModule,
    DxDateRangeBoxModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AccountingModule {}
