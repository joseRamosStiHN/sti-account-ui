import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
    this.currentValue = initialValue.map(date =>
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    );
    this.periodList$ = this.accountService.getAllPeriods();    

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

  onEditPeriod(e: any) {
    console.log("si");
    console.log(e.id);
    
    
    this.router.navigate(['/accounting/period', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/period/new-period']);
  };


  currentValueChanged(event: any): void {
    const date: [string,string] = event.value;
    this.currentValue = date.map(date=> date.toString().replaceAll("/","-"));
  };
}
