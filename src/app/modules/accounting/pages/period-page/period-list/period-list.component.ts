import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { PeriodsResponse } from 'src/app/modules/accounting/models/APIModels';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';


const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const pastNow = new Date();
const initialValue: [Date, Date] = [
  new Date(pastNow.getTime() - msInDay * 30),
  new Date(now.getTime()),
];

@Component({
  selector: 'app-period-list',
  templateUrl: './period-list.component.html',
  styleUrl: './period-list.component.css'
})
export class PeriodListComponent {


  periodList$: Observable<PeriodModel[]> | undefined;

  private readonly router = inject(Router);
  private readonly accountService = inject(PeriodService);
  
  currentValue!: (string | number | Date)[];
  roles: string[] = ['admin', 'teller'];


  ngOnInit(): void {
    this.currentValue = initialValue;
    this.periodList$ = this.accountService.getAllPeriods().pipe(
      map((periods: PeriodsResponse[]) =>
        
        periods.map(period => (
          {
          ...period,
          status: period.status === 'ACTIVO'
        }))
      )
    );

    this.periodList$.forEach((data)=>{
      console.log(data);
      
    })
      
  
     
    

  }

  onSearch(): void {
    const [dateIniStr, dateEndStr] = this.currentValue;
    const [yearIni, monthIni, dayIni] = dateIniStr.toString().split('-').map(num => parseInt(num, 10));
    const [yearEnd, monthEnd, dayEnd] = dateEndStr.toString().split('-').map(num => parseInt(num, 10));
    const dateIni = new Date(yearIni, monthIni - 1, dayIni);
    const dateEnd = new Date(yearEnd, monthEnd - 1, dayEnd);

    if (dateEnd < dateIni) {
      return;
    }

   
  }

  fillData(period:PeriodModel[]){

    
  }

  onEditPeriod(e: any) {
    
    this.router.navigate(['/accounting/configuration/period/update', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/configuration/period/create']);
  };


  currentValueChanged(event: any): void {
    const date: [Date,Date] = event.value;
    this.currentValue = date;
  };

  formatDate(rowData: any): string {
    const date = new Date(rowData.startDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses son 0-indexados
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

}
