import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './accounting-dashboard.component.html',
  styleUrl: './accounting-dashboard.component.css'
})
export class AccountingDashboardComponent {

  constructor(private router: Router){

  }


  navigate(ruta:string){

    this.router.navigate([ruta]);

    
  }

}
