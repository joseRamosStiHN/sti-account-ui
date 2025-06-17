import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersRequest, UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { confirm } from 'devextreme/ui/dialog';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrl: './user-pages.component.css',
})
export class UserPagesComponent implements OnInit {

  @Input('id') id?: number;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;

  userList$: Observable<UsersResponse[]> | undefined;

  private readonly router = inject(Router);
  private readonly userService = inject(UsersService);


  ngOnInit(): void {
    if (this.id) {
      this.userList$ = this.userService.getAllUsersByCompany(Number(this.id));
    } else {
      this.userList$ = this.userService.getAllUsers();
    }

  }

  addUser() {
    if (this.id) {
      this.router.navigate(['/dashboard/user/create/userByCompany/' + this.id]);
    } else {
      this.router.navigate(['/dashboard/user/create']);
    }

  }

  onEditUser(e: any) {
    if (this.id) {
      this.router.navigate([`/dashboard/user/edit/${e.id}/userByCompany`, this.id]);
    } else {
      this.router.navigate(['/dashboard/user/edit', e.id]);
    }

  }

  async onToggleUser(event: Event, data: any) {
    const inputElement = event.target as HTMLInputElement;
    const newState = inputElement.checked;
    const originalState = data.data.active;

    inputElement.checked = originalState;

    const action = newState ? 'activar' : 'desactivar';
    const message = `¿Está seguro de que desea ${action} el usuario ${data.data.userName}?`;

    const result = await confirm(message, 'Advertencia');

    if (!result) {
      return;
    }

    const savedUser = localStorage.getItem('userData');
    if (!savedUser) {
      console.error('No se encontró información del usuario en sesión');
      return;
    }
    const currentUser = JSON.parse(savedUser);
    const userUpdateId = currentUser.id;


    const companiesWithRoles = data.data.companies.map((companyRelation: { company: { id: any; }; roles: any[]; }) => ({
      id: companyRelation.company.id,
      roles: companyRelation.roles.map((role: { id: any; }) => ({ id: role.id }))
    }));

    const userRequest: UsersRequest = {
      ...data.data,
      active: newState,
      companies: companiesWithRoles,
      globalRoles: data.data.globalRoles.map((role: { id: any; }) => ({ id: role.id })),
      isActive: newState
    };

    this.userService.updateUser(userRequest, data.data.id, userUpdateId).subscribe({
      next: () => {
        data.data.active = newState;
        inputElement.checked = newState;

        this.toastType = typeToast.Success;
        this.messageToast = `Usuario ${action === 'activar' ? 'activado' : 'desactivado'} correctamente`;
        this.showToast = true;
      },
      error: (err) => {
        console.error('Error updating user:', err);
        data.data.active = originalState;
        inputElement.checked = originalState;
        this.toastType = typeToast.Error;
        this.messageToast = `Error al ${action} el usuario`;
        this.showToast = true;
      },
    });
  }
}
