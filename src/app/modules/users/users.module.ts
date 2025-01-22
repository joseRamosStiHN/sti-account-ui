import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from 'src/app/modules/users/user-routing.module';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { HttpClientModule } from '@angular/common/http';
import { UserPagesComponent } from './pages/user-pages/user-pages.component';
import { UserEditComponent } from './pages/user-pages/user-edit/user-edit.component';
import { UserCreateComponent } from './pages/user-pages/user-create/user-create.component';
import { FormsModule } from '@angular/forms';
import { DxDropDownBoxModule, DxListModule, DxTagBoxModule, DxToastModule } from 'devextreme-angular';

@NgModule({
  declarations: [UserPagesComponent, UserEditComponent, UserCreateComponent],
  imports: [
    CommonModule,
    FormsModule,
    UserRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    HttpClientModule,
    DxListModule,
    DxToastModule,
    DxDropDownBoxModule,
    DxTagBoxModule,
  ],
})
export class UsersModule { }
