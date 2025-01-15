import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { UserInfoService } from 'src/app/shared/userInfo.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    userName: new FormControl('laurent.caceres', [Validators.required]),
    password: new FormControl('Lcaceres97', [Validators.required]),
  });

  erroLogin: boolean = false;

  private authService = inject(AuthServiceService);
  private readonly router = inject(Router);
  private userInfoService = inject(UserInfoService);
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
      roles: []
    });

    

  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (n: any) => {
          if (n.active) {
            this.userInfoService.setUserInfo(n);
            this.authService.setLogin(n);
            this.router.navigate(['/dashboard']);


          }
        },
        error: (err: any) => {

          this.erroLogin = true;


          console.log(err);
        }
      });

    }
  }
}
