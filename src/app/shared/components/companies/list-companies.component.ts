import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, first, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanieResponse, companyByUser, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
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

  companyList$?: Observable<CompanieResponse[]>;
  isAdmind: boolean = false;

  paginatorArray: number[] = [];


  startPage = 0
  endPage = 10;
  numberPages = 10;

  private loadedPages = new Set<number>();


  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);
  private readonly authService = inject(AuthServiceService);
  private readonly companyService = inject(CompaniesService);

  constructor() { }

  ngOnInit(): void {
   this.loadedPages = this.companyService.getLoadPages()

    this.navigationService.setNavLinks([]);
    this.navigationService.setCompany('');

    const savedUser = localStorage.getItem('userData');
    const userId: number = this.authService.getUserId();

    if (savedUser) {
      const usuario = JSON.parse(savedUser);

      if (userId == 0 && usuario.id != null) {
        this.saveUserInMemory(usuario.id);
        this.saveCompanysInMemory(this.startPage,this.endPage)
      } else {
        this.isAdmind = this.authService.getRolesUser().some((role: any) =>
          role.name === 'ADMINISTRADOR' && role.global);

        this.companyList$ = of(this.companyService.getCompanies());
        this.paginator(Number(localStorage.getItem('totalPages')));
      }
    } else {

      this.saveUserInMemory(userId);
      this.saveCompanysInMemory(this.startPage,this.endPage)
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


  goTo(cmp: CompanieResponse) {
    const {roles , ...company}= cmp;
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

      if (search == "") {

        this.companyList$ =  of(this.companyService.getCompanies());
        this.paginator(Number(localStorage.getItem('totalPages')));
        this.deactivePaginator();
        this.activePaginator(0);
        return
      }


      this.startPage = 0
      this.endPage = 10;
      this.numberPages = 10;

      let companie = this.companyService.getCompanies().filter((companie: any) => {
        return companie.name.toUpperCase().includes(search.toUpperCase())
      })


      this.paginatorArray = Array.from({ length: Math.ceil(companie.length / this.numberPages) }, 
      (_, i) => i);
      

      this.companyList$ = of(companie);
      this.deactivePaginator();
      this.activePaginator(0);

    }

  }


  paginator(totalPages: number,) {
    this.paginatorArray = Array.from({ length: totalPages }, (_, i) => i);
  }


  
  page(page: number) {
    
    if (!this.loadedPages.has(page)  ) {     
      this.saveCompanysInMemory(page -1, this.numberPages,page); 
 
    }

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

        if (!this.loadedPages.has(++i)  ) {     
          this.saveCompanysInMemory(i -1, this.numberPages, i++);   
        }

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
        localStorage.setItem('userData', JSON.stringify({ ...rest }));
        this.authService.setLogin(data);

      }
    });
  }

  saveCompanysInMemory(page:number , size:number, pageLoad = 1) {
    
    this.companyService.getCompanysByUser(page,size).subscribe((data)=>{
      let companias:any = this.companyService.getCompanies();
      companias = [...companias, data.response]
      
      this.companyService.setCompanys(companias.flat());
      this.companyList$ = of(this.companyService.getCompanies());
      this.loadedPages.add(pageLoad);
      this.companyService.setLoadPages(this.loadedPages);

      localStorage.setItem('totalPages', data.totalPages.toString());
      this.paginator(data.totalPages);
    });
  }

}
