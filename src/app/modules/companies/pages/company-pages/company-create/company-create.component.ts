import { Component, inject, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { filter, from, map, mergeMap, Observable, pipe, toArray } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyRequest, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { RolesResponse, UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { ToastType } from 'devextreme/ui/toast';

@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css',
})
export class CompanyCreateComponent implements OnInit {
  accountsFromSystem: boolean = true;

  companyList$: Observable<CompanyResponse[]> | undefined;
  userList$: Observable<UsersResponse[]> | undefined;
  companyForm: CompanyRequest;

  userByCompany: UsersResponse[] = []

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  rolesList$: Observable<RolesResponse[]> | undefined;

  @Input('id') id?: number;


  private readonly companyService = inject(CompaniesService);
  private readonly userService = inject(UsersService);

  constructor() {
    this.companyForm = {
      isActive: true,
      address: "",
      description: "",
      email: "",
      name: "",
      phone: "",
      roles: [],
      userIds: [],
      rtn: "",
      type: "",
      website: "",
      permissions: [1]
    }
  }

  async ngOnInit() {
    this.companyList$ = this.companyService.getAllCompanies();

    this.rolesList$ = await this.userService.getAllRoles().pipe(
      map((roles) => {
        return roles.filter(role => !role.global);
      })
    );
    if (this.id) {
      await this.companyService.getCompanyById(Number(this.id)).subscribe(data => {

        this.companyForm = {
          address: data.address,
          description: data.description,
          email: data.email,
          isActive: data.active,
          name: data.name,
          permissions: data.permissions,
          phone: data.phone,
          roles: data.roles,
          rtn: data.rtn,
          type: data.type,
          createdAt: data.createdAt,
          id: data.id,
          tenantId: data.tenantId,
          website: data.website,
          userIds: []
        }
      });

      this.userList$ = this.userService.getAllUsers().pipe(
        mergeMap(users => {
          return from(users).pipe(
            mergeMap(async (user, index) => {
              const role = this.companyForm.roles[index];
              const id = role ? await role.id : null;
              return {
                ...user,
                role: id
              };
            }),
            toArray()
          );
        })
      );

      this.userList$.subscribe(users => {
        const userFilter = users.filter(user => user.role != null);
        this.userByCompany = userFilter.map(user => ({
          active: user.active,
          activeRoles: user.activeRoles,
          userName: user.userName,
          companies: user.companies,
          createdAt: user.createdAt,
          email: user.email,
          firstName: user.firstName,
          id: user.id,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          roles: user.roles,
          role: user.role
        }));

    
      });
      


    } else {
      this.userList$ = this.userService.getAllUsers();
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
    if (this.companyForm.tenantId == undefined) {
      this.companyForm = {
        ...this.companyForm, ...this.companyForm.tenantId
      }
    }

    this.companyForm.roles= []
    this.companyForm.userIds = [];
    this.userByCompany.forEach((user) => {
      console.log(this.userByCompany);
      
      this.companyForm.userIds?.push(user.id);
      this.companyForm.roles.push({ id: user.role });
    });
    if (this.companyForm.roles.length == 0) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Seleccione al menos un Usario';
      this.showToast = true;
      return
    }

    this.companyService.updateCompany(this.companyForm, Number(this.id)).subscribe({
      next: (data) => {
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

    if (this.companyForm.tenantId == undefined) {
      this.companyForm = {
        ...this.companyForm, ...this.companyForm.tenantId
      }
    }

    this.userByCompany.forEach((user) => {
      this.companyForm.userIds?.push(user.id);
      this.companyForm.roles.push({ id: user.role });
    })

    if (this.companyForm.roles.length == 0) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Seleccione al menos un Usario';
      this.showToast = true;
      return
    }

    this.companyService.createCompany(this.companyForm).subscribe({
      next: (data) => {
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

  goBack() {
    window.history.back();
  }

  onRowUpdated(usuario: any) {
    if (this.id) {
      console.log(usuario.data,"usuario");
      
      const userExist = this.userByCompany.find(user => user.id == usuario.data.id);
      console.log(userExist);
      
      if (!userExist){
        this.userByCompany.push(usuario.data);
      }else{
        userExist.role= usuario.data.role;
      }
      
      return
    }

    const userExist = this.userByCompany.find(user => user.id == usuario.data.id);
    if (!userExist) {
      this.userByCompany.push(usuario.data);
    }

  }
}
