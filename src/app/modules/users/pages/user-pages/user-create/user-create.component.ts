import { Component, inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastType } from 'devextreme/ui/toast';
import { map, Observable } from 'rxjs';
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
  rolesList$: RolesResponse[] = [];

  userForm: UsersRequest;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  private readonly companyService = inject(CompaniesService);
  private readonly userService = inject(UsersService);


  constructor() {
    this.userForm = {
      active: true,
      companies: [],
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: '',
      roles: [],
      userName: ''
    }
  }

  ngOnInit(): void {
    console.log(this.txtPassword);
    this.companyService.getAllCompanies().subscribe(
      data => {
        this.companyList$ = data.map(company => {
          company.active = false;
          company.permissions = [1]
          company.roles = [{ "id": 1, "name": "ADMIN", "description": "Administrador del sistema", "active": true }]
          return company
        })
      });

    this.userService.getAllRoles().subscribe(
      data => {
        this.rolesList$ = data.map(roles => {
          roles.active = false;
          return roles
        })
      });;

  }


  async save(e: NgForm) {


    if (e.valid) {



      const companys = this.companyList$.filter(company => company.active == true);
      this.userForm.companies = companys;

      const roles = this.rolesList$.filter(roles => roles.active == true);
      this.userForm.roles = roles;

      const request = {
        ...this.userForm, password: e.value.password
      }

      if (request.companies.length ==0) {
        this.toastType = typeToast.Error;
        this.messageToast = 'Seleccione al menos una Empresa';
        this.showToast = true;
        return
      }


      if (request.roles.length ==0) {
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

  goBack() {
    window.history.back();
  }



}
