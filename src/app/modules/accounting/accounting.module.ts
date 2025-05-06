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
import { SeniorAccountantsComponent } from './pages/senior-accountants/senior-accountants.component';
import { JournalEntriesComponent } from './pages/accounting-page/journal-entries/journal-entries.component';
import { JournalItemsComponent } from './pages/accounting-page/journal-items/journal-items.component';
import { AccountingAdjustmentComponent } from './pages/accounting-page/accounting-adjustment/accounting-adjustment.component';
import { AdjustmentListComponent } from './pages/accounting-page/accounting-adjustment/adjustment-list/adjustment-list.component';
import { TrialBalanceComponent } from 'src/app/modules/accounting/components/reports/trial-balance/trial-balance.component';
import { CreditNotesComponent } from 'src/app/modules/accounting/pages/accounting-page/credit-notes/credit-notes.component';
import { DebitNotesComponent } from 'src/app/modules/accounting/pages/accounting-page/debit-notes/debit-notes.component';
import { CreditNoteListComponent } from 'src/app/modules/accounting/pages/accounting-page/credit-notes/credit-note-list/credit-note-list.component';
import { DebitNoteListComponent } from 'src/app/modules/accounting/pages/accounting-page/debit-notes/debit-note-list/debit-note-list.component';
import { AccountingClosingComponent } from 'src/app/modules/accounting/pages/accounting-page/accounting-closing/accounting-closing.component';
import { TaxSettingsComponent } from 'src/app/modules/accounting/pages/tax-settings/tax-settings/tax-settings.component';
import { TaxSettingsListComponent } from 'src/app/modules/accounting/pages/tax-settings/tax-settings-list/tax-settings-list.component';
import { BulkConfigurationListComponent } from 'src/app/modules/accounting/pages/upload-bulk/upload-bulk-configuration/bulk-configuration-list/bulk-configuration-list.component';
import { BulkConfigurationComponent } from 'src/app/modules/accounting/pages/upload-bulk/upload-bulk-configuration/bulk-configuration/bulk-configuration.component';
import { UploadBulkFileComponent } from 'src/app/modules/accounting/pages/upload-bulk/upload-bulk-file/upload-bulk-file.component';
import { VariousOperationsListComponent } from 'src/app/modules/accounting/pages/various-operations/various-operations-list/various-operations-list.component';
import { VariousOperationsComponent } from 'src/app/modules/accounting/pages/various-operations/various-operations/various-operations.component';

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
    SeniorAccountantsComponent,
    JournalEntriesComponent,
    JournalItemsComponent,
    AccountingAdjustmentComponent,
    AdjustmentListComponent,
    TrialBalanceComponent,
    CreditNotesComponent,
    DebitNotesComponent,
    CreditNoteListComponent,
    DebitNoteListComponent,
    AccountingClosingComponent,
    TaxSettingsComponent,
    TaxSettingsListComponent,
    BulkConfigurationListComponent,
    BulkConfigurationComponent,
    UploadBulkFileComponent,
    VariousOperationsComponent,
    VariousOperationsListComponent
    
  ],
  providers: [ReportServiceService, JournalService],
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
