import { Component, inject, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { filter, from, lastValueFrom, map, mergeMap, Observable, pipe, toArray } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanieResponse, CompanyRequest, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { RolesResponse, UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { ToastType } from 'devextreme/ui/toast';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { AccountService } from 'src/app/modules/accounting/services/account.service';
import { error } from 'console';
import { environment } from '@environment/environment';

@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css',
})
export class CompanyCreateComponent implements OnInit {
  accountsFromSystem: boolean = true;

  companyList$: Observable<CompanyResponse[]> | undefined;
  userList$: UsersResponse[] = [];
  companyForm: CompanyRequest;

  userByCompany: UsersResponse[] = []

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  rolesList$: Observable<RolesResponse[]> | undefined;

  imagePreview: string | ArrayBuffer | null = null;
  imageBase64: string = '';

  @Input('id') id?: number;

  tenantId:string='';
  userId?: number;

  rolesCompanys$: RolesResponse[] = [];

     apiLogo = environment.SECURITY_API_URL +'/api/v1/company/logo/'


  private readonly companyService = inject(CompaniesService);
  private readonly userService = inject(UsersService);
  private readonly periodService = inject(PeriodService);
  private readonly accountService = inject(AccountService);

  constructor() {
    this.companyForm = {
      isActive: true,
      address: "",
      description: "",
      email: "",
      name: "",
      phone: "",
      users: [],
      rtn: "",
      type: "",
      website: "",
      companyLogo: ""
    }
  }

  async ngOnInit() {

    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      this.userId = usuario.id
    }


    this.companyList$ = this.companyService.getAllCompanies();

    this.userService.getAllUsers().subscribe((data) => {
      this.userList$ = data;
    });

    const users = await lastValueFrom(this.userService.getAllUsers());
    this.userList$ = users;

    const roles = await lastValueFrom(this.userService.getAllRoles());
    this.rolesCompanys$ = roles.filter(roles => !roles.global).map(roles => {
      roles.active = false;
      return roles;
    });
    if (this.id) {
      const company = await lastValueFrom(this.companyService.getCompanyById(Number(this.id)));

      this.companyForm = {
        address: company.address,
        description: company.description,
        email: company.email,
        isActive: company.active,
        name: company.name,
        phone: company.phone,
        rtn: company.rtn,
        type: company.type,
        website: company.website,
        companyLogo: company.companyLogo,
        users: company.users,
        tenantId: company.tenantId

      }
      this.imagePreview = `data:image/png;base64,${company.companyLogo}`;

      this.userList$ = this.userList$.map((user1: any) => {
        const matchingUser = this.companyForm.users.find((user2: any) => {
          return user1.id === user2.user.id;
        });
        if (matchingUser) {
          const roleIds = matchingUser.roles.map((role: any) => role.id);
          user1.roles = roleIds;
        }
        return user1;
      });

    }
  }
  onAccountConfig(event: Event) {
    const data = event.target as HTMLInputElement;
    this.accountsFromSystem = Boolean(parseInt(data.value));
  }


  async onSubmit(e: NgForm) {
    if (e.valid) {
      if (this.id) {
        this.update();
      } else {
        this.save()
      }

    }

  }

  async update() {
    const users = this.userList$
      .filter(users => users.roles && users.roles.length > 0)
      .map(user => ({
        id: user.id,
        roles: user.roles.map((role: any) => ({ id: role }))
      }));

    this.companyForm.users = users;
    this.companyForm.companyLogo = this.imageBase64;

    if (this.companyForm.users.length == 0) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Seleccione al menos un Usario';
      this.showToast = true;
      return
    }

    this.companyService.updateCompany(this.companyForm, Number(this.id), Number(this.userId)).subscribe({
      next: (data) => {

        if (this.tenantId != "") {
          this.cloneAccountsToNewCompany(this.tenantId, this.companyForm.tenantId || '');
        }

        this.companyService.setLoadCompanysMap(new Map<number, CompanieResponse[]>());
        this.toastType = typeToast.Success;
        this.messageToast = 'Empresa registrada exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 1000);

      },
      error: (err) => {
        console.error('Error creando Empresa:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el Empresa';
        this.showToast = true;
      },
    });


  }

  async save() {

    const users = this.userList$
      .filter(users => users.roles && users.roles.length > 0)
      .map(user => ({
        id: user.id,
        roles: user.roles.map((role: any) => ({ id: role }))
      }));

    this.companyForm.users = users;
    this.companyForm.companyLogo = this.imageBase64;


    if (this.companyForm.users.length == 0) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Seleccione al menos un Usario';
      this.showToast = true;
      return
    }

    this.companyService.createCompany(this.companyForm).subscribe({
      next: (data) => {
        this.createPeriod(data.tenantId);
        this.cloneAccountsToNewCompany(this.tenantId, data.tenantId);
        this.companyService.setLoadCompanysMap(new Map<number, CompanieResponse[]>());

        this.toastType = typeToast.Success;
        this.messageToast = 'Empresa registrada exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 1000);

      },
      error: (err) => {
        console.error('Error creando Empresa:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el Empresa';
        this.showToast = true;
      },
    });


  }

  createPeriod(tenantId: string) {

    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const startPeriod = this.toLocalDateTime(firstDayOfYear);

    const period: any = {
      closureType: "Anual",
      periodName: "Periodo Contable Anual",
      isAnnual: true,
      periodStatus: "ACTIVE",
      daysPeriod: 365,
      startPeriod: null,
      status: true

    }

    const request = { ...period, startPeriod };

    this.periodService.createPeriodAnual(request, tenantId).subscribe({
      error: (err) => {
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo anaul de la empresa';
        this.showToast = true;
      },
    });
  }


  cloneAccountsToNewCompany(sourceTenantId: string | null, tenantId: string) {
    this.accountService.cloneAccountByCompany(sourceTenantId, tenantId).subscribe({
      next: (data) => {
        console.log(data);

      },

      error: (err) => {
        console.log(err);

        this.toastType = typeToast.Error;
        this.messageToast = 'No se pudo hacer el clonado de las cuentas';
        this.showToast = true;
      }
    });
  }

  goBack() {
    window.history.back();
  }




  toLocalDateTime(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };


  cellTemplate(container: any, options: any) {
    const noBreakSpace = '\u00A0';

    const assignees = (options.value || []).map(
      (assigneeId: number) => options.column!.lookup!.calculateCellValue!(assigneeId),
    );
    const text = assignees.join(', ');

    container.textContent = text || noBreakSpace;
    container.title = text;
  }




  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result;

        const base64String = (reader.result as string).split(',')[1];
        this.imageBase64 = base64String;


      };

      reader.readAsDataURL(file);
    }
  }




}
