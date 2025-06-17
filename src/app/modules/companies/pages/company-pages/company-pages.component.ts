import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanieResponse, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { confirm } from 'devextreme/ui/dialog';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';

@Component({
  selector: 'app-company-pages',
  templateUrl: './company-pages.component.html',
  styleUrl: './company-pages.component.css',
})
export class CompanyPagesComponent implements OnInit {

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  userId?: number;
  userList$: UsersResponse[] = [];
  imageBase64: string = '';

  companyList$: Observable<CompanyResponse[]> | undefined;
  private readonly router = inject(Router);
  private readonly companyService = inject(CompaniesService);

  ngOnInit(): void {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.userId = user.id
    }


    this.companyList$ = this.companyService.getAllCompanies();
  }

  addCompany(): void {
    this.router.navigate(['/dashboard/companies/create']);
  }

  goBack() {
    window.location.reload();
  }

  onEditCompany(e: any) {
    this.router.navigate(['/dashboard/companies/edit', e.id]);
  }


  async onToggleCompany(event: Event, data: any) {
    const inputElement = event.target as HTMLInputElement;
    const newState = inputElement.checked;
    const originalState = data.data.active;

    inputElement.checked = originalState;

    const action = newState ? 'activar' : 'desactivar';
    const message = `¿Está seguro de que desea ${action} la empresa ${data.data.name}?`;

    const result = await confirm(message, 'Advertencia');

    if (!result) {
      return;
    }

    data.data.active = newState;

    const companyRoles = data.data.users.flatMap((userCompany: any) =>
      userCompany.roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        global: role.global
      }))
    );

    const users = this.userList$
      .filter(user => user.roles && user.roles.length > 0)
      .map(user => ({
        id: user.id,
        roles: user.roles.map((role: any) => ({ id: role }))
      }));

    const companyRequest = {
      ...data.data,
      users: users,
      companyLogo: this.imageBase64,
      isActive: newState
    };

    this.companyService.updateCompany(companyRequest, companyRequest.id, Number(this.userId)).subscribe({
      next: () => {
        this.toastType = typeToast.Success;
        this.messageToast = `Empresa ${action === 'activar' ? 'activada' : 'desactivada'} correctamente`;
        this.showToast = true;

        if (action === 'activar') {
          const companyResponse: CompanieResponse = {
            id: data.data.id,
            name: data.data.name,
            description: data.data.description,
            address: data.data.address,
            rtn: data.data.rtn,
            type: data.data.type,
            email: data.data.email,
            phone: data.data.phone,
            website: data.data.website,
            tenantId: data.data.tenantId,
            createdAt: data.data.createdAt,
            roles: companyRoles,
            active: data.data.active
          };
          this.companyService.addCompany(companyResponse);
        } else {
          this.companyService.removeCompany(data.data.id);
        }
      },
      error: (err) => {
        console.error('Error updating company:', err);
        data.data.active = originalState;
        inputElement.checked = originalState;
        this.toastType = typeToast.Error;
        this.messageToast = `Error al ${action} la empresa`;
        this.showToast = true;
      },
    });
  }

}
