import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from 'src/app/modules/users/users.service';
import { PasswordRecoveryRequest } from 'src/app/modules/login/models/ApiModelsLogin';


@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css']
})
export class PasswordRecoveryComponent {

  toastType: ToastType = typeToast.Info;
  messageToast: string = '';
  showToast: boolean = false;
  isLoading: boolean = false;
  passwordRecoveryForm: PasswordRecoveryRequest;

  private userService = inject(UsersService);
  private readonly router = inject(Router);

  constructor() {
    this.passwordRecoveryForm = {
      email: ""
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.showToast = false;

      this.userService.recoverPassword(this.passwordRecoveryForm).subscribe({
        next: () => {
          this.showSuccessMessage('Se ha enviado un correo con instrucciones para recuperar tu contraseña');
          setTimeout(() => this.backToLogin(), 5000);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private showSuccessMessage(message: string) {
    this.toastType = typeToast.Success;
    this.messageToast = message;
    this.showToast = true;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.messageToast = 'No existe un usuario con este correo electrónico';
    } else if (error.error?.message) {
      this.messageToast = `Error: ${error.error.message}`;
    } else {
      this.messageToast = 'Ocurrió un error inesperado. Por favor intente nuevamente.';
    }

    this.toastType = typeToast.Error;
    this.showToast = true;
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}