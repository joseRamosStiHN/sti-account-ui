import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyCreateComponent } from 'src/app/modules/companies/pages/company-pages/company-create/company-create.component';
import { CompanyPagesComponent } from 'src/app/modules/companies/pages/company-pages/company-pages.component';

const routers: Routes = [
  {
    path: '',
    component: CompanyPagesComponent,
  },
  {
    path: 'create',
    component: CompanyCreateComponent,
  },
  {
    path: 'edit/:id',
    component: CompanyCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule],
})
export class CompanyRoutingModule {}
