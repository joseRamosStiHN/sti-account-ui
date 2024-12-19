import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export class UserCreateComponent implements OnInit {
  txtPassword!: string;
  txtConfirmPassword!: string;

  ngOnInit(): void {
    console.log(this.txtPassword);
  }
}
