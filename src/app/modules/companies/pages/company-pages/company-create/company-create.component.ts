import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css',
})
export class CompanyCreateComponent implements OnInit {

  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;
  @Input('id') id?: number;

  accountsFromSystem: number = 1;

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
  imageChanged = false;
  rtnExists: boolean = false;



  tenantId: string = '';
  userId?: number;

  rolesCompanys$: RolesResponse[] = [];

  apiLogo = environment.SECURITY_API_URL + '/api/v1/company/logo/'

  searchTerm: string = '';
  filteredUsers: UsersResponse[] = [];
  originalUsers: UsersResponse[] = [];
  private searchTextBox: any;

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
    this.originalUsers = [...users];
    this.filteredUsers = [...users];

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
    this.accountsFromSystem = parseInt(data.value);
    console.log(this.accountsFromSystem);
  }

  fullName(data: any): string {
    return `${data.firstName} ${data.lastName}`;
  }


  async checkRtnExists(rtn: string): Promise<boolean> {
    if (!rtn) return false;

    try {
      const companies = await lastValueFrom(this.companyService.getAllCompanies());
      return companies.some(company => company.rtn === rtn && (!this.id || company.tenantId !== this.companyForm.tenantId));
    } catch (error) {
      console.error('Error checking RTN:', error);
      return false;
    }
  }



  async onSubmit(e: NgForm) {

    if (!e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor, complete todos los campos requeridos.';
      this.showToast = true;
      return;
    }

    if (!this.imagePreview && !this.imageChanged && !this.id) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor seleccione una imagen.';
      this.showToast = true;
      return;
    }

    this.rtnExists = await this.checkRtnExists(this.companyForm.rtn);
    if (this.rtnExists) {
      this.toastType = typeToast.Error;
      this.messageToast = 'El RTN ingresado ya está registrado.';
      this.showToast = true;
      return;
    }


    if (e.valid) {
      if (this.id) {
        this.update();
      } else {
        this.save()
      }

    }

  }

  async update() {
    try {
      // 1) Asegura que el grid guarde la edición actual del TagBox
      if (this.dataGrid?.instance) {
        await this.dataGrid.instance.saveEditData();
      }

      // 2) Toma la misma fuente de datos que usa el grid
      const source = (this.filteredUsers && this.filteredUsers.length > 0)
        ? this.filteredUsers
        : this.userList$;

      // 3) Normaliza roles y arma el payload de usuarios
      const users = (source || [])
        .map(u => ({ ...u, roles: Array.isArray(u.roles) ? u.roles : [] }))
        .filter(u => u.roles.length > 0)
        .map(u => ({
          id: u.id,
          roles: u.roles.map((roleId: number) => ({ id: Number(roleId) }))
        }));

      // 4) Asigna users al form (cast puntual para no tocar tus interfaces)
      (this.companyForm as any).users = users;

      // 5) Logo: en update solo si cambió la imagen
      if (this.imageChanged && this.imageBase64) {
        this.companyForm.companyLogo = this.imageBase64;
        this.imagePreview = `data:image/png;base64,${this.imageBase64}`;
      }

      // 6) Validación de usuarios/roles
      if (!users.length) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos un rol para el usuario.';
        this.showToast = true;
        return;
      }

      // 7) Llamada al servicio
      this.companyService.updateCompany(this.companyForm, Number(this.id), Number(this.userId)).subscribe({
        next: () => {
          if (this.tenantId !== '' && this.accountsFromSystem !== 0) {
            this.cloneAccountsToNewCompany(this.tenantId, this.companyForm.tenantId || '');
          }

          this.companyService.setLoadCompanysMap(new Map<number, CompanieResponse[]>());
          this.toastType = typeToast.Success;
          this.messageToast = 'Empresa actualizada exitosamente';
          this.showToast = true;

          setTimeout(() => {
            this.imageChanged = false;
            this.goBack();
          }, 1000);
        },
        error: (err) => {
          console.error('Error actualizando Empresa:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al actualizar la empresa';
          this.showToast = true;
          this.imageChanged = false;
        },
      });

    } catch (err) {
      console.error('Error en update():', err);
      this.toastType = typeToast.Error;
      this.messageToast = 'Ocurrió un error al actualizar la empresa.';
      this.showToast = true;
    }
  }

  async save() {
    try {
      // 1) Asegura que el grid guarde la edición actual del TagBox
      if (this.dataGrid?.instance) {
        await this.dataGrid.instance.saveEditData();
      }

      // 2) Toma la misma fuente de datos que usa el grid
      const source = (this.filteredUsers && this.filteredUsers.length > 0)
        ? this.filteredUsers
        : this.userList$;

      // 3) Normaliza roles y arma el payload de usuarios
      const users = (source || [])
        .map(u => ({ ...u, roles: Array.isArray(u.roles) ? u.roles : [] }))
        .filter(u => u.roles.length > 0)
        .map(u => ({
          id: u.id,
          roles: u.roles.map((roleId: number) => ({ id: Number(roleId) }))
        }));

      // 4) Asigna users al form (cast puntual para no tocar tus interfaces)
      (this.companyForm as any).users = users;

      // 5) Logo en create: usa lo que tengas en base64 (o vacío)
      this.companyForm.companyLogo = this.imageBase64 || '';

      // 6) Validación de usuarios/roles
      if (!users.length) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos un rol para el usuario.';
        this.showToast = true;
        return;
      }

      // 7) Llamada al servicio
      this.companyService.createCompany(this.companyForm).subscribe({
        next: (data) => {
          // Crea periodo anual de la nueva empresa
          this.createPeriod(data.tenantId);

          // Clonado de cuentas si corresponde
          if (this.accountsFromSystem !== 0) {
            this.cloneAccountsToNewCompany(this.tenantId, data.tenantId);
          }

          this.companyService.setLoadCompanysMap(new Map<number, CompanieResponse[]>());
          this.toastType = typeToast.Success;
          this.messageToast = 'Empresa registrada exitosamente';
          this.showToast = true;

          setTimeout(() => this.goBack(), 1000);
        },
        error: (err) => {
          console.error('Error creando Empresa:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al crear la empresa';
          this.showToast = true;
        },
      });

    } catch (err) {
      console.error('Error en save():', err);
      this.toastType = typeToast.Error;
      this.messageToast = 'Ocurrió un error al registrar la empresa.';
      this.showToast = true;
    }
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
        this.imageBase64 = (reader.result as string).split(',')[1];
        this.imageChanged = true;
      };

      reader.readAsDataURL(file);
    }
  }

  searchHandler = (e: any) => {
    this.searchTerm = e.value;
    this.filterUsers();

    setTimeout(() => {
      if (this.searchTextBox) {
        this.searchTextBox.focus();
      }
    }, 100);
  };

  onToolbarPreparing(e: any) {
    e.toolbarOptions.items.forEach((item: any) => {
      if (item.widget === 'dxTextBox') {
        item.options = {
          ...item.options,
          onInitialized: (e: any) => {
            this.searchTextBox = e.component;
          }
        };
      }
    });
  }

  refreshData = () => {
    this.searchTerm = '';
    this.filteredUsers = [...this.originalUsers];
  };

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.originalUsers];
      return;
    }

    setTimeout(() => {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredUsers = this.originalUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchTermLower) ||
        user.lastName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower)
      );
    });
  }

  onSelectionChanged(event: { selectedRowsData: any; }) {
    const selectedRows = event.selectedRowsData;
  }


}
