import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyRoutingModule } from 'src/app/modules/companies/company-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CompanyPagesComponent } from './pages/company-pages/company-pages.component';
import { CompanyEditComponent } from './pages/company-pages/company-edit/company-edit.component';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { CompanyCreateComponent } from './pages/company-pages/company-create/company-create.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CompanyPagesComponent, CompanyEditComponent, CompanyCreateComponent],
  providers: [HttpClientModule],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    HttpClientModule,
    FormsModule
  ],
})
export class CompaniesModule {}
