import { Component, inject, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastType } from 'devextreme/ui/toast';
import { lastValueFrom, map, Observable, scan } from 'rxjs';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';
import { RolesResponse, UsersRequest } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export class UserCreateComponent implements OnInit {
  txtPassword!: string;
  txtConfirmPassword!: string;
  companyList$: CompanyResponse[] = [];
  rolesGlobals$: RolesResponse[] = [];
  rolesCompanys$: RolesResponse[] = [];


  userForm: UsersRequest;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  userId?:number;

  @Input('id') id?: number;

  private readonly companyService = inject(CompaniesService);
  private readonly userService = inject(UsersService);


  constructor() {
    this.userForm = {
      isActive: true,
      companies: [],
      email: "",
      firstName: "",
      lastName: "",
      userPhone: '',
      globalRoles: [],
      userName: '',
      password: '',
      userAddress:''
    }
  }

 

  async ngOnInit() {  

    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      const usuario = JSON.parse(savedUser);
      this.userId = usuario.id
    }

    try {
      const roles = await lastValueFrom(this.userService.getAllRoles());
      this.rolesGlobals$ = roles.filter(roles => roles.global).map(roles => {
        roles.active = false;
        return roles;
      });
  
      this.rolesCompanys$ = roles.filter(roles => !roles.global).map(roles => {
        roles.active = false;
        return roles;
      });
  
      const companies = await lastValueFrom(this.companyService.getAllCompanies());
      this.companyList$ = companies.map(company => {
        company.active = false;
        return company;
      });
  
      if (this.id) {
        const user = await lastValueFrom(this.userService.getUSerById(Number(this.id)));
        this.userForm = {
          isActive: user.active,
          companies: user.companies,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userPhone: user.userPhone,
          globalRoles: user.globalRoles,
          userName: user.userName,
          userAddress:user.userAddress
        };
  
        this.rolesGlobals$ = this.rolesGlobals$.map((role) => {
          this.userForm.globalRoles.forEach((roleGlobal) => {
            if (role.id === roleGlobal.id) {
              role.active = true;
            }
          });
          return role;
        });
  
        this.companyList$ = this.companyList$.map((company: any) => {
          const matchingCompany = this.userForm.companies.find((companyForm: any) => {
            return company.id === companyForm.company.id;
          });
          if (matchingCompany) {
            const roleIds = matchingCompany.roles.map((role: any) => role.id);
            company.roles = roleIds;
          }
          return company;
        });
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
    }
  }
  

  onSubmit(e: NgForm){
    if (this.id) {
      this.update(e)
    }else{
      this.save(e);
    }
  }


  async save(e: NgForm) {


    if (e.valid) {

      const companys = this.companyList$
        .filter(company => company?.roles && company.roles.length > 0)
        .map(company => ({
          id: company.id,
          roles: company.roles.map((role: any) => ({ id: role }))
        }));

      this.userForm.companies = companys;

      const roles = this.rolesGlobals$.filter(roles => roles.active == true);
      this.userForm.globalRoles = roles;

      const request = {
        ...this.userForm, password: e.value.password
      }

      if (request.companies.length == 0) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos una Empresa';
        this.showToast = true;
        return
      }


      if (request.globalRoles.length == 0) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos un Rol';
        this.showToast = true;
        return
      }


      if (this.txtPassword != this.txtConfirmPassword) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Contraseñas no coinciden';
        this.showToast = true;
        return
      }


      await this.userService.createUser(request).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Usuario creado exitosamente';
          this.showToast = true;
          setTimeout(() => {
            this.goBack();
          }, 3000);

        },
        error: (err) => {
          console.error('Error creando Usuario:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al crear el Usuario';
          this.showToast = true;
        },
      });
    }


  }

  async update(e: NgForm) {


    if (e.valid) {      
      const companys = this.companyList$
        .filter(company => company?.roles  && company.roles.length > 0)
        .map(company => ({
          id: company.id,
          roles: company.roles.map((role: any) => ({ id: role }))
        }));

      this.userForm.companies = companys;

      const roles = this.rolesGlobals$.filter(roles => roles.active == true);
      this.userForm.globalRoles = roles;

      const request = {
        ...this.userForm, password: e.value.password
      }

      if (request.companies.length == 0) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos una Empresa';
        this.showToast = true;
        return
      }


      if (request.globalRoles.length == 0) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos un Rol';
        this.showToast = true;
        return
      }

      await this.userService.updateUser(request, Number(this.id), Number(this.userId)).subscribe({
        next: (data) => {
          this.toastType = typeToast.Success;
          this.messageToast = 'Usuario actualizado exitosamente';
          this.showToast = true;
          setTimeout(() => {
            this.goBack();
          }, 3000);

        },
        error: (err) => {
          console.error('Error actualizando Usuario:', err);
          this.toastType = typeToast.Error;
          this.messageToast = 'Error al actualizar el Usuario';
          this.showToast = true;
        },
      });
    }


  }

  calculateFilterExpression(filterValue: any, selectedFilterOperation: any, target: any) {
    if (target === 'search' && typeof (filterValue) === 'string') {
      return [(this as any).dataField, 'contains', filterValue];
    }
    return function (rowData: any) {
      return (rowData.AssignedEmployee || []).indexOf(filterValue) !== -1;
    };
  }

  cellTemplate(container: any, options: any) {
    const noBreakSpace = '\u00A0';

    const assignees = (options.value || []).map(
      (assigneeId: number) => options.column!.lookup!.calculateCellValue!(assigneeId),
    );
    const text = assignees.join(', ');

    container.textContent = text || noBreakSpace;
    container.title = text;
  }

  goBack() {
    window.history.back();
  }



}
