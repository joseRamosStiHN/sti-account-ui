import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { Login } from 'src/app/shared/models/LoginResponseModel';
import { NavigationService } from 'src/app/shared/navigation.service';
import { UserInfoService } from 'src/app/shared/userInfo.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<UsersResponse | null> | undefined;
  infoService = inject(UserInfoService);
  companyList$: Observable<CompanyResponse[]> | undefined;

  isAdmind: boolean = false;

  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);

  constructor() { }

  ngOnInit(): void {
    this.navigationService.setNavLinks([]);
    this,this.navigationService.setNameCompany('');
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      this.user$ = this.userService.getUSerById(usuario.id);
      this.user$.subscribe(data => {
        this.isAdmind = data?.globalRoles.some((role: any) => role.name === 'ADMINISTRADOR' && role.global);
      })
    } else {
      let usuario:any;
      this.infoService.userDetail$.subscribe((data)=> {
        usuario = data?.id;
      });
      
      this.user$ = this.userService.getUSerById(usuario);
      this.user$.subscribe((data) => {
        if (data) {
          this.isAdmind = data.globalRoles.some((role: any) => role.name === 'ADMINISTRADOR' && role.global);
          localStorage.setItem('userData', JSON.stringify(data));
        }
      });

    }
  }

  goTo(company: any) {
    localStorage.setItem('company', JSON.stringify(company));
    this.router.navigate(['/accounting']);

  };

  goToCompany() {
    this.router.navigate(['/dashboard/companies']);
  };

  goToUser = () => {
    this.router.navigate(['/dashboard/user']);
  };
}
