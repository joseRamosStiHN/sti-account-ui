import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CustomerInvoicingComponent } from './accounting/customer-invoicing/customer-invoicing.component';
import { AccountSettingsComponent } from './accounting/account-settings/account-settings.component';
import { SupplierInvoicingComponent } from './accounting/supplier-invoicing/supplier-invoicing.component';
import { AccountingDashboardComponent } from './accounting/accounting-dashboard/accounting-dashboard.component';


export const ADMIN_ROUTES: Routes = [
    {
        path: '', component: AccountingDashboardComponent
    },
    { path: 'customer-invoicing', component: CustomerInvoicingComponent, data: { breadcrumb: 'customer invoicing' } },
    { path: 'account-settings', component: AccountSettingsComponent, data: { breadcrumb: 'account settings' } },
    { path: 'suplier-invoice', component: SupplierInvoicingComponent, data: { breadcrumb: 'suplier invoicing' } },




];