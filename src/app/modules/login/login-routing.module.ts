import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from 'src/app/modules/login/login-page/login-page.component';
import { AuthLayoutComponent } from 'src/app/shared/layouts/auth-layout/auth-layout.component';

const routers: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [{ path: '', component: LoginPageComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
