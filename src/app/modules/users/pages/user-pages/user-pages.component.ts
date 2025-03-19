import { Component, inject, Input, OnInit } from '@angular/core';
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

  @Input('id') id?: number;

  userList$: Observable<UsersResponse[]> | undefined;

  private readonly router = inject(Router);
  private readonly userService = inject(UsersService);


  ngOnInit(): void {
    if (this.id) {
      this.userList$ = this.userService.getAllUsersByCompany(Number(this.id));
    }else{
      this.userList$ = this.userService.getAllUsers();
    }

  }

  addUser() {
    if (this.id) {
      this.router.navigate(['/dashboard/user/create/userByCompany/'+this.id]);
    }else{
      this.router.navigate(['/dashboard/user/create']);
    }
  
  }

  onEditUser(e: any) {
    if (this.id) {
      this.router.navigate([`/dashboard/user/edit/${e.id}/userByCompany`, this.id]);
    }else{
      this.router.navigate(['/dashboard/user/edit', e.id]);
    }
   
  }
}
