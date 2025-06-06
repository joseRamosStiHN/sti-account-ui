import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UsersService } from 'src/app/modules/users/users.service';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-manage-password',
  templateUrl: './manage-password.component.html',
  styleUrls: ['./manage-password.component.css']
})
export class ManagePasswordComponent {

  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  isLoading: boolean = false;

  private authService = inject(AuthServiceService);
  private userService = inject(UsersService);
  private readonly router = inject(Router);

  constructor(
  ) { }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

onSubmit(form: NgForm) {
    if (form.valid && this.passwordData.newPassword === this.passwordData.confirmPassword) {
      this.isLoading = true;

      const userId = this.authService.getUserId();
      const requestData = {
        userId: userId,
        currentPassword: this.passwordData.currentPassword,
        newPassword: this.passwordData.newPassword,
        confirmPassword: this.passwordData.confirmPassword
      };

      this.userService.changePassword(requestData).subscribe({
        next: () => this.handleSuccess(form),
        error: (err: HttpErrorResponse) => this.handleError(err),
        complete: () => this.isLoading = false
      });
    } else {
      this.showToastMessage('Por favor complete correctamente todos los campos', typeToast.Error);
    }
  }

  private handleSuccess(form: NgForm) {
    this.showToastMessage('Contraseña cambiada exitosamente. Serás redirigido para iniciar sesión.', typeToast.Success);
    form.resetForm();
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    
    setTimeout(() => {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          console.error('Error al cerrar sesión:', err);
          this.router.navigate(['/login']);
        }
      });
    }, 3000);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado. Por favor intente nuevamente.';
    
    if (error.status === 400) {
      if (Array.isArray(error.error)) {
        errorMessage = error.error[0]?.message || 'Error de validación';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado';
    }

    this.showToastMessage(errorMessage, typeToast.Error);
    this.isLoading = false;
  }

  private showToastMessage(message: string, type: ToastType) {
    this.messageToast = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }

}