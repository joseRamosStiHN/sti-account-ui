import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '@environment/environment';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import {
  CompanieResponse,
  companyByUser,
  CompanyResponse,
} from 'src/app/modules/companies/models/ApiModelsCompanies';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';
import {
  typeToast,
  DocumentType,
} from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { DxToastModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DxToastModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<UsersResponse | null> | undefined;

  apiLogo = environment.SECURITY_API_URL + '/api/v1/company/logo/';

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  searchQuery: string = '';
  currentPage: number = 0;
  numberPages: number = 10;
  totalPages: number = 0;
  companyList$: Observable<CompanieResponse[]> = of([]);
  isAdmind: boolean = false;
  paginatorArray: number[] = [];
  private companiasMap = new Map<number, CompanieResponse[]>();

  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);
  private readonly authService = inject(AuthServiceService);
  private readonly companyService = inject(CompaniesService);
  private readonly transactionService = inject(TransactionService);

  constructor() { }

  ngOnInit(): void {
    this.companiasMap = this.companyService.getLoadCompanysMap();
    this.navigationService.setNavLinks([]);
    this.navigationService.setCompany('');

    const savedUser = localStorage.getItem('userData');
    const userId: number = this.authService.getUserId();

    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      this.isAdmind = this.authService
        .getRolesUser()
        .some((role: any) => role.name === 'ADMINISTRADOR' && role.global);

      if ((userId == 0 && usuario.id != null) || this.companiasMap.size == 0) {
        this.saveUserInMemory(usuario.id);
        this.loadCompanies(0, this.numberPages);
      } else {
        this.setupSearch();
      }
    } else {
      this.saveUserInMemory(userId);
      this.loadCompanies(0, this.numberPages);
    }
  }


  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private setupSearch(): void {
    this.companyList$ = this.companyService.companies$.pipe(
      switchMap(companies => {
        if (this.searchQuery.trim() === '') {
          return this.companyService.companysMap$.pipe(
            map(companysMap => companysMap.get(this.currentPage) ?? [])
          );
        } else {
          return of(
            companies.filter(company =>
              company.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            )
          );
        }
      })
    );
  }

  search(): void {
    if (this.searchQuery.trim() === '') {
      this.loadCompanies(this.currentPage, this.numberPages);
    } else {
      this.setupSearch();
    }
  }

  private loadCompanies(page: number, size: number): void {
    this.companyService.getCompanysByUser(page, size).subscribe({
      next: (data) => {
        this.companiasMap.set(page, data.response);
        this.companyService.setCompanys(data.response);
        this.companyService.setLoadCompanysMap(this.companiasMap);

        this.totalPages = data.totalPages;
        localStorage.setItem('totalPages', data.totalPages.toString());
        this.paginator(data.totalPages);

        this.companyList$ = of(data.response);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }


  goTo(cmp: CompanieResponse) {
    const { roles, ...company } = cmp;
    localStorage.setItem('company', JSON.stringify(company));
    this.companyService.setCompany(cmp);
    this.router.navigate(['/accounting']);
  }

  goToCompany() {
    this.router.navigate(['/dashboard/companies']);
  }

  goToUser = () => {
    this.router.navigate(['/dashboard/user']);
  };

  addUserCompany = (companie: any) => {
    this.router.navigate(['/dashboard/user/company/', companie.id]);
  };


  paginator(totalPages: number) {
    this.paginatorArray = Array.from({ length: totalPages }, (_, i) => i);
  }

  private paginateArray(array: any[], itemsPerPage: number): {
    map: Map<number, any[]>,
    totalPages: number
  } {
    const result = new Map<number, any[]>();
    const totalPages = Math.ceil(array.length / itemsPerPage);

    for (let i = 0; i < totalPages; i++) {
      const start = i * itemsPerPage;
      const end = start + itemsPerPage;
      result.set(i, array.slice(start, end));
    }

    return { map: result, totalPages };
  }

  page(page: number) {
    this.currentPage = page - 1;
    this.deactivePaginator();
    this.activePaginator(page - 1);

    if (!this.companiasMap.has(this.currentPage)) {
      this.saveCompanysInMemory(this.currentPage, this.numberPages);
    } else {
      this.companyList$ = of(this.companiasMap.get(this.currentPage) ?? []);
    }
  }

  pageBack() {
    const pages = document.querySelectorAll('#page');
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].className.includes('active') && i > 0) {
        pages[i].classList.remove('active');
        pages[--i].classList.add('active');

        if (!this.companiasMap.has(i)) {
          this.saveCompanysInMemory(i, this.numberPages);
        } else {
          this.companyList$ = this.companyService.companysMap$.pipe(
            map((map) => map.get(i) ?? [])
          );
        }
      }
    }
  }

  pageNext() {
    const pages = document.querySelectorAll('#page');
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].className.includes('active') && i < pages.length - 1) {
        pages[i].classList.remove('active');
        pages[++i].classList.add('active');

        if (!this.companiasMap.has(i)) {
          this.saveCompanysInMemory(i, this.numberPages);
        } else {
          this.companyList$ = this.companyService.companysMap$.pipe(
            map((map) => map.get(i) ?? [])
          );
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
    pages[id].classList.add('active');
  }

  deactivePaginator() {
    const pages = document.querySelectorAll('#page');
    pages.forEach((page) => {
      if (page.className.includes('active')) {
        page.classList.remove('active');
      }
    });
  }

  saveUserInMemory(userId: number) {
    this.user$ = this.userService.getUSerById(userId);
    this.user$.subscribe((data) => {
      if (data) {
        this.isAdmind = data.globalRoles.some(
          (role: any) => role.name === 'ADMINISTRADOR' && role.global
        );
        const { globalRoles, createdAt, ...rest } = data;
        localStorage.setItem('userData', JSON.stringify({ ...rest }));
        localStorage.setItem('isAdmin', JSON.stringify(this.isAdmind));

        this.authService.setLogin(data);
      }
    });
  }

  saveCompanysInMemory(page: number, size: number) {
    this.companyService.getCompanysByUser(page, size).subscribe((data) => {
      let companias: any = this.companyService.getCompanies();
      companias = [...companias, data.response];

      this.companiasMap.set(page, data.response);

      this.companyService.setCompanys(companias.flat());

      this.companyList$ = this.companyService.companysMap$.pipe(
        map((map) => map.get(page) ?? [])
      );

      this.companyService.setLoadCompanysMap(this.companiasMap);

      localStorage.setItem('totalPages', data.totalPages.toString());
      this.paginator(data.totalPages);
    });
  }

  dividirBusquedad(array: any, length: number) {
    const result = [];
    for (let i = 0; i < array.length; i += length) {
      result.push(array.slice(i, i + length));
    }

    return result;
  }

  onPageChange(newValue: number) {
    this.numberPages = newValue;
    this.currentPage = 0;
    this.searchQuery = '';
    this.saveCompanysInMemory(0, this.numberPages);
  }

  async deleteCompany(company: CompanieResponse) {
    if (!company.tenantId) {
      this.toastType = typeToast.Error;
      this.messageToast = 'La compañía no tiene TenantId configurado';
      this.showToast = true;
      return;
    }

    const actionByUser = this.authService.getUserId();

    try {
      const hasTransactions = await this.checkCompanyTransactions(
        company.id,
        company.tenantId
      );
      if (hasTransactions) {
        this.toastType = typeToast.Error;
        this.messageToast =
          'No se puede eliminar la empresa porque existen transacciones asociadas';
        this.showToast = true;
        return;
      }
    } catch (error) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Error al verificar transacciones';
      this.showToast = true;
      console.error('Error checking transactions:', error);
      return;
    }

    const result = await confirm(
      `¿Está seguro de que desea eliminar la empresa ${company.name}? Esta acción no se puede deshacer.`,
      'Confirmar eliminación'
    );

    if (!result) {
      return;
    }

    this.companyService.deleteCompany(company.id, actionByUser).subscribe({
      next: () => {
        this.companiasMap = new Map<number, CompanieResponse[]>();
        this.saveCompanysInMemory(0, this.numberPages);

        this.toastType = typeToast.Success;
        this.messageToast = 'Empresa eliminada correctamente';
        this.showToast = true;
      },
      error: (err) => {
        this.toastType = typeToast.Error;
        if (err.error?.error?.includes('TenantId')) {
          this.messageToast =
            'Error: No se pudo identificar la organización. Por favor, seleccione una compañía nuevamente.';
          setTimeout(() => this.router.navigate(['/select-company']), 3000);
        } else {
          this.messageToast = 'Error al eliminar la empresa';
        }
        this.showToast = true;
        console.error('Error deleting company:', err);
      },
    });
  }

  private async checkCompanyTransactions(
    companyId: number,
    tenantId: string
  ): Promise<boolean> {
    try {
      const transactions = await this.transactionService
        .checkCompanyTransactions(tenantId)
        .pipe(first())
        .toPromise();

      if (transactions && transactions.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking transactions:', error);
      return true;
    }
  }
}
