import { Routes } from '@angular/router';
import { AccountingDashboardComponent } from './admin/accounting/accounting-dashboard/accounting-dashboard.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [



  { path: '', component: DashboardComponent,data: {
    breadcrumb: {
      label: 'Home',
      info: { myData: { icon: 'home', iconType: 'material' } }
    }
  } },
  
  {
    path: 'accounting',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },


];
