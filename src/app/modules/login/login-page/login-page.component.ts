import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { LoginRequest } from 'src/app/modules/login/models/ApiModelsLogin';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {

  toastType: ToastType = typeToast.Info;
  messageToast: string = '';
  showToast: boolean = false;
  loginForm: LoginRequest;

  backgroundStyle = {
    'background-image': 'url("/assets/accounting-bg.jpg")',
    'background-repeat': 'no-repeat',
    'background-size': 'cover'
  };

  errorLogin: boolean = false;
  showPassword = false;

  private authService = inject(AuthServiceService);
  private readonly router = inject(Router);
  constructor() {
    this.loginForm = {
      userName: "",
      password: ""
    }
  }

  ngOnInit(): void {

    localStorage.removeItem('userData');
    localStorage.removeItem('company');
    this.authService.setLogin({
      userName: '',
      active: false,
      companies: [],
      createdAt: new Date(),
      email: '',
      firstName: '',
      id: 0,
      lastName: '',
      globalRoles: []
    });



  }

  trimUsername(): void {
    if (this.loginForm.userName) {
      this.loginForm.userName = this.loginForm.userName.trim();
    }
  }

  onSubmit(e: NgForm) {

    this.trimUsername();

    if (!e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor, complete todos los campos requeridos.';
      this.showToast = true;
      return;
    }

    if (e.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: (n: any) => {
          if (n.active) {
            this.authService.setLogin(n);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: any) => {
          this.errorLogin = true;
        }
      });

    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwordRecovery() {
    this.router.navigate(['/password-recovery']);
  }
}