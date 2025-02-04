import { Routes } from '@angular/router';
import { CompanyPagesComponent } from 'src/app/modules/companies/pages/company-pages/company-pages.component';
import { ListCompaniesComponent } from 'src/app/shared/components/companies/list-companies.component';
import { AccountigGuard } from 'src/app/shared/handlers/Guards/AccountingGuard';
import { AuthGuard } from 'src/app/shared/handlers/Guards/AuthGuard';
import { AuthLayoutComponent } from 'src/app/shared/layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from 'src/app/shared/layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },

  {
    path: 'login',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate:[AuthGuard],
    children: [
      {
        path: '',
        component: ListCompaniesComponent,
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('./modules/companies/companies.module').then(
            (m) => m.CompaniesModule
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./modules/users/users.module').then((m) => m.UsersModule),
      },
    ],
  },
  {
    path: 'accounting',
    component: DashboardLayoutComponent,
    canActivate:[AuthGuard,AccountigGuard],
    loadChildren: () =>
      import('./modules/accounting/accounting.module').then(
        (m) => m.AccountingModule
      ),
  },
];
