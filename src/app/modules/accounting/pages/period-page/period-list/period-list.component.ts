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

    this.periodList$ = this.accountService.getAllPeriods();

  }

  onSearch(): void {
   let [dateInit, dateEnd] = this.currentValue;

    if (dateEnd < dateInit) {
      return;
    }
  }

  fillData(period: PeriodModel[]) {


  }

  onEditPeriod(e: any) {

    this.router.navigate(['/accounting/configuration/period/update', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/configuration/period/create']);
  };


  currentValueChanged(event: any): void {
    const date: [Date, Date] = event.value;
    this.currentValue = date;
  };

  formatDateEnd(rowData: any): string {
    const date = new Date(rowData.endPeriod);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatDateInit(rowData: any): string {
    const date = new Date(rowData.startPeriod);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

}
