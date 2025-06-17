import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, NgForm, ValidationErrors } from '@angular/forms';
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

// Agrega esta función dentro de tu componente (antes de @Component)
function validatePasswordStrength(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isLengthValid = value.length >= 8;

  if (!hasUpperCase) {
    return { noUpperCase: true };
  }
  if (!hasLowerCase) {
    return { noLowerCase: true };
  }
  if (!hasNumber) {
    return { noNumber: true };
  }
  if (!hasSpecialChar) {
    return { noSpecialChar: true };
  }
  if (!isLengthValid) {
    return { minlength: { requiredLength: 8, actualLength: value.length } };
  }

  return null;
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

  validatePasswordStrength(control: AbstractControl): void {
    const value = control.value;
    if (!value) {
      control.setErrors(null);
      return;
    }

    const errors: ValidationErrors = {};

    if (!/[A-Z]/.test(value)) {
      errors['noUpperCase'] = true;
    }
    if (!/[a-z]/.test(value)) {
      errors['noLowerCase'] = true;
    }
    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['noSpecialChar'] = true;
    }
    if (value.length < 8) {
      errors['minlength'] = { requiredLength: 8, actualLength: value.length };
    }

    const currentErrors = control.errors || {};
    const otherErrors = Object.keys(currentErrors)
      .filter(key => !['required','noUpperCase', 'noLowerCase', 'noNumber', 'noSpecialChar', 'minlength'].includes(key))
      .reduce((obj, key) => {
        obj[key] = currentErrors[key];
        return obj;
      }, {} as ValidationErrors);

    const newErrors = Object.keys(errors).length > 0 ? { ...otherErrors, ...errors } :
      Object.keys(otherErrors).length > 0 ? otherErrors : null;

    control.setErrors(newErrors);
  }

}