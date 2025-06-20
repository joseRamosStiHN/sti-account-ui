import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '@environment/environment';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
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
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DxToastModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<UsersResponse | null> | undefined;

  companyList$?: Observable<CompanieResponse[]>;
  isAdmind: boolean = false;

  paginatorArray: number[] = [];
  numberPages = 10;

  private companiasMap = new Map<number, CompanieResponse[]>();

  apiLogo = environment.SECURITY_API_URL + '/api/v1/company/logo/';

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);
  private readonly authService = inject(AuthServiceService);
  private readonly companyService = inject(CompaniesService);
  private readonly transactionService = inject(TransactionService);

  constructor() {}

  ngOnInit(): void {
    this.companiasMap = this.companyService.getLoadCompanysMap();

    this.navigationService.setNavLinks([]);
    this.navigationService.setCompany('');

    const savedUser = localStorage.getItem('userData');
    const userId: number = this.authService.getUserId();

    if (savedUser) {
      const usuario = JSON.parse(savedUser);

      if ((userId == 0 && usuario.id != null) || this.companiasMap.size == 0) {
        this.saveUserInMemory(usuario.id);
        this.saveCompanysInMemory(0, this.numberPages);
      } else {
        this.isAdmind = this.authService
          .getRolesUser()
          .some((role: any) => role.name === 'ADMINISTRADOR' && role.global);

        // this.companyList$ = of(this.companyService());
        //this.companyList$ = of(this.companiasMap.get(0) ?? []);
        this.companyList$ = this.companyService.companysMap$.pipe(
          map((map) => map.get(0) ?? [])
        );
        this.paginator(Number(localStorage.getItem('totalPages')));
      }
    } else {
      this.saveUserInMemory(userId);
      this.saveCompanysInMemory(0, this.numberPages);
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

  searchCompany(search: string) {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      if (search === '') {
        // Cuando se borra el texto de búsqueda, restablece el mapa de empresas
        this.companiasMap = new Map<number, CompanieResponse[]>();
        this.saveCompanysInMemory(0, this.numberPages);
        //this.companyList$ = of(this.companiasMap.get(0) ?? []);
        this.companyList$ = this.companyService.companysMap$.pipe(
          map((map) => map.get(0) ?? [])
        );
        this.paginator(Number(localStorage.getItem('totalPages')));
        this.deactivePaginator();
        return;
      }

      // Filtrar las empresas basadas en el nombre
      const filteredCompanies = this.companyService
        .getCompanies()
        .filter((companie: CompanieResponse) => {
          return companie.name.toUpperCase().includes(search.toUpperCase());
        });

      // Actualizar la lista de empresas sin duplicados
      this.updateCompanyList(filteredCompanies);
    }
  }

  private updateCompanyList(companies: CompanieResponse[]) {
    // Eliminar duplicados
    const uniqueCompanies = Array.from(
      new Set(companies.map((company) => company.id))
    ).map((id) => companies.find((company) => company.id === id));

    this.paginatorArray = Array.from(
      { length: Math.ceil(uniqueCompanies.length / this.numberPages) },
      (_, i) => i
    );
    this.companiasMap = new Map<number, CompanieResponse[]>();
    const companiesByMap = this.dividirBusquedad(
      uniqueCompanies,
      this.numberPages
    );

    for (let index = 0; index < this.paginatorArray.length; index++) {
      const currentArray = companiesByMap[index];
      this.companiasMap.set(index, currentArray);
    }
    //this.companyList$ = of(this.companiasMap.get(0) ?? []);
    this.companyList$ = this.companyService.companysMap$.pipe(
      map((map) => map.get(0) ?? [])
    );
    this.deactivePaginator();
    this.activePaginator(0);
  }

  paginator(totalPages: number) {
    this.paginatorArray = Array.from({ length: totalPages }, (_, i) => i);
  }

  page(page: number) {
    if (!this.companiasMap.has(page - 1)) {
      this.saveCompanysInMemory(page - 1, this.numberPages);
    } else {
      //this.companyList$ = of(this.companiasMap.get(page - 1) ?? []);
      this.companyList$ = this.companyService.companysMap$.pipe(
        map((map) => map.get(page - 1) ?? [])
      );
    }

    this.deactivePaginator();
    this.activePaginator(page - 1);
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
          //this.companyList$ = of(this.companiasMap.get(i) ?? []);
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
          //this.companyList$ = of(this.companiasMap.get(i) ?? []);
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

      //this.companyList$ = of(this.companiasMap.get(page) ?? []);
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

    this.companiasMap = new Map<number, CompanieResponse[]>();
    this.saveCompanysInMemory(0, this.numberPages);

    //this.companyList$ = of(this.companiasMap.get(0) ?? []);
    this.companyList$ = this.companyService.companysMap$.pipe(
      map((map) => map.get(0) ?? [])
    );
    this.paginator(Number(localStorage.getItem('totalPages')));
    this.deactivePaginator();
    this.activePaginator(0);
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
