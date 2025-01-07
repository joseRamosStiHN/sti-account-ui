import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrl: './user-pages.component.css',
})
export class UserPagesComponent implements OnInit {


  userList$: Observable<UsersResponse[]> | undefined;

  private readonly router = inject(Router);
  private readonly userService = inject(UsersService);


  ngOnInit(): void {

    this.userList$ = this.userService.getAllUsers();


  }

  addUser() {
    this.router.navigate(['/dashboard/user/create']);
  }

  onEditUser(e: any) {
    this.router.navigate(['/dashboard/user/create', e.id]);
  }
}
