import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { LoginRoutingModule } from 'src/app/modules/login/login-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginPageComponent } from 'src/app/modules/login/login-page/login-page.component';
import { PasswordRecoveryComponent } from 'src/app/modules/login/password-recovery/password-recovery.component';
import { DxToastModule } from 'devextreme-angular';

@NgModule({
  declarations: [LoginPageComponent, PasswordRecoveryComponent],
  exports: [],
  imports: [
    CommonModule,
    RouterModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxToastModule,

    HttpClientModule,
  ],
})
export class LoginModule { }
