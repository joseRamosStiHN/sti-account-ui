import { Component, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PeriodClosing } from 'src/app/modules/accounting/models/APIModels';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';

@Component({
  selector: 'app-accounting-closing',
  templateUrl: './accounting-closing.component.html',
  styleUrl: './accounting-closing.component.css'
})
export class AccountingClosingComponent {


  private readonly periodService = inject(PeriodService);
  infoClosing:Observable<PeriodClosing>;

  constructor(){
    this.infoClosing = this.periodService.getInfoClosingPeriod();
  }



}
