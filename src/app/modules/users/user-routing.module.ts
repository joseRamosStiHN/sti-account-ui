import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCreateComponent } from 'src/app/modules/users/pages/user-pages/user-create/user-create.component';
import { UserPagesComponent } from 'src/app/modules/users/pages/user-pages/user-pages.component';
const routers: Routes = [
  {
    path: '',
    component: UserPagesComponent,
  },
  {
    path: 'company/:id',
    component: UserPagesComponent,
  },
  {
    path: 'create',
    component: UserCreateComponent,
  },
  {
    path: 'create/userByCompany/:companyId',
    component: UserCreateComponent,
  },
  {
    path: 'edit/:id',
    component: UserCreateComponent,
  },
  {
    path: 'edit/:id/userByCompany/:companyId',
    component: UserCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
