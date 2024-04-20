import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientComponent } from './components/client/client.component';
import { AccountingPageComponent } from './pages/accounting-page/accounting-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientListComponent } from './components/client-list/client-list.component';

const routes: Routes = [
  {
    path: '',
    component: AccountingPageComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'client-invoicing', component: ClientComponent },
      { path: 'client-list', component: ClientListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
