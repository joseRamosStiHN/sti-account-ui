import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
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
  authService = inject(AuthServiceService);
  companyList$: Observable<any> | undefined;
  isAdmind: boolean = false;

  paginatorArray: number[] = [];

  private numberPages = 2;


  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);

  constructor() { }

  ngOnInit(): void {
    this.navigationService.setNavLinks([]);
    this.navigationService.setNameCompany('');
    const savedUser = localStorage.getItem('userData');


    if (savedUser) {
      const usuario = JSON.parse(savedUser);

      this.isAdmind = usuario.globalRoles.some((role: any) =>
        role.name === 'ADMINISTRADOR' && role.global);
      this.user$ = of(usuario);
      this.companyList$ = of(usuario.companies.slice(0, this.numberPages));
      this.paginator(usuario);

    } else {
      let usuario: any;
      this.authService.userAuthenticate$.subscribe((data) => {
        usuario = data?.id;
      });
      this.user$ = this.userService.getUSerById(usuario);
      this.user$.subscribe((data) => {
        if (data) {
          this.isAdmind = data.globalRoles.some((role: any) => role.name === 'ADMINISTRADOR' && role.global);
          localStorage.setItem('userData', JSON.stringify(data));
          this.companyList$ = of(data.companies.slice(0, this.numberPages));

          this.paginator(data);
        }
      });

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

  searchCompany(search: string) {

    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      if (search == "") {

        this.companyList$ = of(usuario.companies.slice(0, this.numberPages));
        this.paginator(usuario);
             this.deactivePaginator();
      this.activePaginator(0);
        return
      }

      let companie = usuario.companies.filter((companie: any) => {
        return companie.company.name.toUpperCase().includes(search.toUpperCase())
      })

      this.paginatorArray = Array.from({ length: Math.round(companie.length / this.numberPages) }, (_, i) => i);
      this.companyList$ = of(companie.slice(0,this.numberPages));
      this.deactivePaginator();
      this.activePaginator(0);

    }

  }


  paginator(usuario: any,) {
    this.paginatorArray = Array.from({ length: Math.round(usuario.companies.length / this.numberPages) }, (_, i) => i);

  }

  page(page: number) {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      this.companyList$ = of(usuario.companies.slice(page - 1 * this.numberPages, page * this.numberPages));
      this.deactivePaginator();
      this.activePaginator(page-1);
    }
  }

  pageBack() {
    const pages = document.querySelectorAll('#page');
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].className.includes('active') && i > 0  ) {
          pages[i].classList.remove('active');
          pages[--i].classList.add('active');
        }  
  
      }
  }


  pageNext() {
    const pages = document.querySelectorAll('#page');
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].className.includes('active') && i < pages.length -1  ) {
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


  activePaginator(id:number){
    const pages = document.querySelectorAll('#page');
    pages[id].classList.add('active')
  }

  deactivePaginator(){
    const pages = document.querySelectorAll('#page');
    pages.forEach((page)=>{
      if (page.className.includes('active')) {
        page.classList.remove('active');
      }
    })
  }



}
