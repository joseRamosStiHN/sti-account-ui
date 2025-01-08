import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';

@Component({
  selector: 'app-company-pages',
  templateUrl: './company-pages.component.html',
  styleUrl: './company-pages.component.css',
})
export class CompanyPagesComponent implements OnInit {
  
  
  companyList$: Observable<CompanyResponse[]> | undefined;
  private readonly router = inject(Router);
  private readonly companyService = inject(CompaniesService);

  ngOnInit(): void {
   this.companyList$ = this.companyService.getAllCompanies();
  }

  addCompany(): void {
    this.router.navigate(['/dashboard/companies/create']);
  }

  goBack() {
    window.history.back();
  }

  onEditCompany(e: any) {
    this.router.navigate(['/dashboard/companies/edit', e.id]);
  }

}
