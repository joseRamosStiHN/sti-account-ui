import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {

  private readonly router = inject(Router);
  private readonly location = inject(Location);


  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
