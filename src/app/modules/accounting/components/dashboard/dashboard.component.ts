import { Component, inject } from '@angular/core';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {



  private readonly periodService = inject(PeriodService);

  constructor(){

  }

  ngOnInit(): void {
    this.periodService.getAllPeriods().subscribe({
      next: (data) => {

       //console.log(data);

      const company = data.find(c=> c.closureType == "Anual" && c.isAnnual);

      localStorage.setItem('periodo',JSON.stringify(company));
        
       
        
      },
      error: (err) =>console.log("No se pudo obtener el periodo")
      ,
    }
    );
    
  }


  
}
