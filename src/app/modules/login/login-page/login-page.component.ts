import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  backgroundStyle = {
    'background-image': 'url("/assets/accounting-bg.jpg")',
    'background-repeat': 'no-repeat',
    'background-size': 'cover'
  };

  errorLogin: boolean = false;
  showPassword = false;

  private authService = inject(AuthServiceService);
  private readonly router = inject(Router);
  constructor() { }

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

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
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

}