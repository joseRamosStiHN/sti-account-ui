import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Login } from 'src/app/shared/models/LoginResponseModel';
import { UserInfoService } from 'src/app/shared/userInfo.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.css',
})
export class ListCompaniesComponent implements OnInit {
  user$: Observable<Login | null> | undefined;
  infoService = inject(UserInfoService);
  private readonly router = inject(Router);
  constructor() {}

  ngOnInit(): void {
    this.user$ = this.infoService.userDetail$;
  }

  goTo = () => {
    this.router.navigate(['/accounting']);
  };
}
