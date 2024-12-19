import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-pages',
  templateUrl: './company-pages.component.html',
  styleUrl: './company-pages.component.css',
})
export class CompanyPagesComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {}

  addCompany(): void {
    this.router.navigate(['/company/create']);
  }
}
