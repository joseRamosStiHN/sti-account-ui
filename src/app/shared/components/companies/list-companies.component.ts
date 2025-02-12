import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, first, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { Company } from 'src/app/shared/models/LoginResponseModel';
import { NavigationService } from 'src/app/shared/navigation.service';


@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<UsersResponse | null> | undefined;

  companyList$?: Observable<any[]>;
  isAdmind: boolean = false;

  paginatorArray: number[] = [];


  startPage = 0
  endPage = 3;
  numberPages = 3;


  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);
  private readonly authService = inject(AuthServiceService);
  private readonly companyService = inject(CompaniesService);

  constructor() { }

  ngOnInit(): void {
    this.navigationService.setNavLinks([]);
    this.navigationService.setCompany('');

    const savedUser = localStorage.getItem('userData');
    const userId: number = this.authService.getUserId();

    if (savedUser) {
      const usuario = JSON.parse(savedUser);

      if (userId == 0 && usuario.id != null) {
        this.saveUserInMemory(usuario.id);
      } else {

        this.isAdmind = this.authService.getRolesUser().some((role: any) =>
          role.name === 'ADMINISTRADOR' && role.global);
        this.companyList$ = of(this.authService.getCompaniesList());
        this.paginator(usuario);
      }
    } else {
      this.saveUserInMemory(userId);
    }
  }


  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
  search(packageName: string) {
    this.debounceSearch(packageName);
  }

  private debounceSearch = (() => {
    let timeoutId: any;
    return (packageName: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.searchCompany(packageName);
      }, 1000);
    };
  })();


  goTo(cmp: Company) {
    const {roles, ...company} = cmp;
    localStorage.setItem('company', JSON.stringify(company));
    this.companyService.setCompany(cmp)
    this.router.navigate(['/accounting']);

  };

  goToCompany() {
    this.router.navigate(['/dashboard/companies']);
  };

  goToUser = () => {
    this.router.navigate(['/dashboard/user']);
  };


  addUserCompany = (companie:any) => {
    this.router.navigate(['/dashboard/companies/edit', companie.company.id]);
  };

  searchCompany(search: string) {

    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      if (search == "") {

        this.companyList$ =  of(this.authService.getCompaniesList());
        this.paginator(usuario);
        this.deactivePaginator();
        this.activePaginator(0);
        return
      }


      this.startPage = 0
      this.endPage = 3;
      this.numberPages = 3;

      let companie = this.authService.getCompaniesList().filter((companie: any) => {
        return companie.company.name.toUpperCase().includes(search.toUpperCase())
      })


      this.paginatorArray = Array.from({ length: Math.ceil(companie.length / this.numberPages) }, 
      (_, i) => i);
      

      this.companyList$ = of(companie);
      this.deactivePaginator();
      this.activePaginator(0);

    }

  }


  paginator(usuario: any,) {
    this.paginatorArray = Array.from({ length: Math.ceil(usuario.companies.length / this.numberPages) }, (_, i) => i);

  }

  page(page: number) {

    this.startPage = (page - 1) * this.numberPages;
    this.endPage = page * this.numberPages;
    this.deactivePaginator()
    this.activePaginator(page - 1);
  }

  pageBack() {
    const pages = document.querySelectorAll('#page');
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].className.includes('active') && i > 0) {

        this.startPage = (i - 1) * this.numberPages;
        this.endPage = i * this.numberPages;
        pages[i].classList.remove('active');
        pages[--i].classList.add('active');
      }

    }
  }


  pageNext() {
    const pages = document.querySelectorAll('#page');
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].className.includes('active') && i < pages.length - 1) {

        this.startPage = (i + 1) * this.numberPages;
        this.endPage = (i + 1) + 2 * this.numberPages;
        pages[i].classList.remove('active');
        pages[++i].classList.add('active');

      }

    }
  }

  ngAfterViewInit() {
    const pages = document.querySelectorAll('#page');
    if (pages.length > 0) {
      this.activePaginator(0);
    }

  }


  activePaginator(id: number) {
    const pages = document.querySelectorAll('#page');
    pages[id].classList.add('active')
  }

  deactivePaginator() {
    const pages = document.querySelectorAll('#page');
    pages.forEach((page) => {
      if (page.className.includes('active')) {
        page.classList.remove('active');
      }
    })
  }

  saveUserInMemory(userId: number) {
    this.user$ = this.userService.getUSerById(userId);

    this.user$.subscribe((data) => {
      if (data) {

        this.isAdmind = data.globalRoles.some((role: any) => role.name === 'ADMINISTRADOR' && role.global);
        const { globalRoles, createdAt, ...rest } = data;
        const companies = rest.companies.map(({ roles, ...company }: Company) => company.company);
        localStorage.setItem('userData', JSON.stringify({ ...rest, companies }));
        this.companyList$ = of(rest.companies);
        this.authService.setLogin(data);
        this.paginator(data);
      }
    });
  }



}
