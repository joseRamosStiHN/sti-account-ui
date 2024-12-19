import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrl: './user-pages.component.css',
})
export class UserPagesComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {}

  addUser() {
    this.router.navigate(['/user/create']);
  }
}
