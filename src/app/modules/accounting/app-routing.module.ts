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
import { JournalListComponent } from './pages/journal-page/journal-list/journal-list.component';
import { JournalPageComponent } from './pages/journal-page/journal/journal-page.component';
import { PeriodListComponent } from './pages/period-page/period-list/period-list.component';
import { PeriodComponent } from './pages/period-page/period/period.component';
import { BalanceListComponent } from './pages/balance-accounts/balance-list/balance-list.component';
import { BalanceAccountsComponent } from './pages/balance-accounts/balance-accounts/balance-accounts.component';
import { SeniorAccountantsComponent } from 'src/app/modules/accounting/pages/senior-accountants/senior-accountants.component';
import { JournalEntriesComponent } from 'src/app/modules/accounting/pages/accounting-page/journal-entries/journal-entries.component';
import { JournalItemsComponent } from 'src/app/modules/accounting/pages/accounting-page/journal-items/journal-items.component';
import { AccountingAdjustmentComponent } from 'src/app/modules/accounting/pages/accounting-page/accounting-adjustment/accounting-adjustment.component';
import { AdjustmentListComponent } from 'src/app/modules/accounting/pages/accounting-page/accounting-adjustment/adjustment-list/adjustment-list.component';
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
      { path: 'report/trialbalance', component: TrialBalanceComponent },
      { path: 'configuration/journal-list', component: JournalListComponent },
      {
        path: 'configuration/journal/new-journal',
        component: JournalPageComponent,
      },
      {
        path: 'configuration/journal/update-journal/:id',
        component: JournalPageComponent,
      },
      { path: 'configuration/period', component: PeriodListComponent },
      { path: 'configuration/period/create', component: PeriodComponent },
      { path: 'configuration/period/update/:id', component: PeriodComponent },
      {
        path: 'configuration/balance/accounts',
        component: BalanceListComponent,
      },
      {
        path: 'configuration/balance/accounts/inital/:id',
        component: BalanceAccountsComponent,
      },
      {
        path: 'report/senior-accountants',
        component: SeniorAccountantsComponent,
      },
      { path: 'accounting-closing', component: AccountingClosingComponent },
      { path: 'journal-entries', component: JournalEntriesComponent },
      { path: 'journal-items', component: JournalItemsComponent },
      { path: 'adjustment-list', component: AdjustmentListComponent },
      { path: 'new/adjustment', component: AccountingAdjustmentComponent },
      { path: 'adjustment/:id', component: AccountingAdjustmentComponent },

      { path: 'creditnotes-list', component: CreditNoteListComponent },
      { path: 'credit-notes', component: CreditNotesComponent },
      { path: 'credit-notes/:id', component: CreditNotesComponent },
      { path: 'debitnotes-list', component: DebitNoteListComponent },
      { path: 'debit-notes', component: DebitNotesComponent },
      { path: 'debit-notes/:id', component: DebitNotesComponent },

      { path: 'configuration/tax-settings', component: TaxSettingsListComponent },
      { path: 'configuration/tax-settings/create', component: TaxSettingsComponent },
      { path: 'configuration/tax-settings/:id', component: TaxSettingsComponent },

      { path: 'configuration/bulk-configuration', component: BulkConfigurationListComponent },
      { path: 'configuration/bulk-configuration/create', component: BulkConfigurationComponent },
      { path: 'configuration/bulk-configuration/:id', component: BulkConfigurationComponent },
      { path: 'bulk-upload-file', component: UploadBulkFileComponent },
      { path: 'various-operations', component: VariousOperationsComponent },
      { path: 'various-operations/:id', component: VariousOperationsComponent },
      { path: 'various-operations-list', component: VariousOperationsListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
