import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '@environment/environment';
import { Observable, of, first } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanieResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { NavigationService } from 'src/app/shared/navigation.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';
import { DxToastModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DxToastModule],
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.css']
})
export class ListCompaniesComponent implements OnInit {
  apiLogo = environment.SECURITY_API_URL + '/api/v1/company/logo/';

  // Variables de estado
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  searchQuery: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  companyList: CompanieResponse[] = [];
  loading: boolean = false;
  isAdmin: boolean = false;
  allCompanies: CompanieResponse[] = [];
  user$: Observable<UsersResponse | null> | undefined;

  // Servicios
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);
  private readonly authService = inject(AuthServiceService);
  private readonly companyService = inject(CompaniesService);
  private readonly transactionService = inject(TransactionService);

  ngOnInit(): void {
    const savedUser = localStorage.getItem('userData');
    const userId = this.authService.getUserId();

    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.saveUserInMemory(user.id);
    } else if (userId) {
      this.saveUserInMemory(userId);
    }

    this.loadCompanies();
    this.navigationService.setNavLinks([]);
    this.navigationService.setCompany('');
  }

  saveUserInMemory(userId: number): void {
    this.user$ = this.userService.getUSerById(userId);
    this.user$.subscribe({
      next: (data) => {
        if (data) {
          this.isAdmin = data.globalRoles.some(
            (role: any) => role.name === 'ADMINISTRADOR' && role.global
          );
          const { globalRoles, createdAt, ...rest } = data;
          localStorage.setItem('userData', JSON.stringify({ ...rest }));
          localStorage.setItem('isAdmin', JSON.stringify(this.isAdmin));
          this.authService.setLogin(data);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
  }

  private loadCompanies(): void {
    this.loading = true;
    this.companyService.getCompanysByUser(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.companyList = response.content;
          this.allCompanies = [...this.allCompanies, ...response.content];
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.showErrorToast('Error al cargar empresas');
          this.loading = false;
        }
      });
  }

  search(): void {
    if (this.searchQuery.trim() === '') {
      this.loadCompanies();
    } else {
      // Filtrar las compañías almacenadas
      this.companyList = this.allCompanies.filter(company =>
        company.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }


  goTo(company: CompanieResponse): void {
    const { roles, ...companyData } = company;
    localStorage.setItem('company', JSON.stringify(companyData));
    this.companyService.setCompany(company);
    this.router.navigate(['/accounting']);
  }

  goToCompany(): void {
    this.router.navigate(['/dashboard/companies']);
  }

  goToUser(): void {
    this.router.navigate(['/dashboard/user']);
  }

  addUserCompany(company: CompanieResponse): void {
    this.router.navigate(['/dashboard/user/company/', company.id]);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadCompanies();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadCompanies();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  async deleteCompany(company: CompanieResponse): Promise<void> {
    if (!company.tenantId) {
      this.showErrorToast('La compañía no tiene TenantId configurado');
      return;
    }

    const actionByUser = this.authService.getUserId();
    const confirmMessage = `¿Está seguro de que desea eliminar la empresa ${company.name}? Esta acción no se puede deshacer.`;

    const result = await confirm(confirmMessage, 'Confirmar eliminación');
    if (!result) return;

    try {
      const hasTransactions = await this.checkCompanyTransactions(company.id, company.tenantId);
      if (hasTransactions) {
        this.showErrorToast('No se puede eliminar la empresa porque existen transacciones asociadas');
        return;
      }

      this.companyService.deleteCompany(company.id, actionByUser).subscribe({
        next: () => {
          this.showSuccessToast('Empresa eliminada correctamente');
          this.loadCompanies();
        },
        error: (err) => {
          const errorMsg = err.error?.error?.includes('TenantId')
            ? 'Error: No se pudo identificar la organización. Por favor, seleccione una compañía nuevamente.'
            : 'Error al eliminar la empresa';

          this.showErrorToast(errorMsg);

          if (err.error?.error?.includes('TenantId')) {
            setTimeout(() => this.router.navigate(['/select-company']), 3000);
          }
        }
      });
    } catch (error) {
      this.showErrorToast('Error al verificar transacciones');
      console.error('Error:', error);
    }
  }

  private async checkCompanyTransactions(companyId: number, tenantId: string): Promise<boolean> {
    try {
      const transactions = await this.transactionService
        .checkCompanyTransactions(tenantId)
        .pipe(first())
        .toPromise();
      return !!transactions && transactions.length > 0;
    } catch (error) {
      console.error('Error checking transactions:', error);
      return true;
    }
  }

  private showSuccessToast(message: string): void {
    this.toastType = typeToast.Success;
    this.messageToast = message;
    this.showToast = true;
  }

  private showErrorToast(message: string): void {
    this.toastType = typeToast.Error;
    this.messageToast = message;
    this.showToast = true;
  }
}