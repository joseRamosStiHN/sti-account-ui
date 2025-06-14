import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagePasswordComponent } from 'src/app/modules/users/pages/user-pages/manage-password/manage-password.component';
import { UserCreateComponent } from 'src/app/modules/users/pages/user-pages/user-create/user-create.component';
import { UserPagesComponent } from 'src/app/modules/users/pages/user-pages/user-pages.component';
import { AdminGuard } from 'src/app/shared/handlers/Guards/AdminGuard';
const routers: Routes = [
  {
    path: '',
    component: UserPagesComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'company/:id',
    component: UserPagesComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'create',
    component: UserCreateComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'create/userByCompany/:companyId',
    component: UserCreateComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'edit/:id',
    component: UserCreateComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'edit/:id/userByCompany/:companyId',
    component: UserCreateComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'manage-password',
    component: ManagePasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule],
})
export class UserRoutingModule { }
