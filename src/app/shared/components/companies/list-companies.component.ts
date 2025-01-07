import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { Login } from 'src/app/shared/models/LoginResponseModel';
import { UserInfoService } from 'src/app/shared/userInfo.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<Login | null> | undefined;
  infoService = inject(UserInfoService);
  companyList$: Observable<CompanyResponse[]> | undefined;
  
  private readonly router = inject(Router);
  private readonly companyService = inject(CompaniesService);

  constructor() { }

  ngOnInit(): void {



    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      this.user$ = of(JSON.parse(savedUser));
    } else {
      this.user$ = this.infoService.userDetail$;
      this.user$.subscribe((data) => {
        if (data) {
          localStorage.setItem('userData', JSON.stringify(data));
        }
      });
    }

    console.log(savedUser);
    
  }



  goTo(tenandId:string){
    localStorage.setItem('company', JSON.stringify(tenandId));
    this.router.navigate(['/accounting']);

  };

  goToCompany(){
    this.router.navigate(['/dashboard/companies']);
  };

  goToUser = () => {
    this.router.navigate(['/dashboard/user']);
  };
}
