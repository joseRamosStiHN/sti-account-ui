import { Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      breadcrumb: {
        label: 'Home',
        info: { myData: { icon: 'home', iconType: 'material' } },
      },
    },
  },

  {
    path: 'accounting',
    loadChildren: () =>
      import('./modules/accounting/accounting.module').then(
        (m) => m.AccountingModule
      ),
  },
];
