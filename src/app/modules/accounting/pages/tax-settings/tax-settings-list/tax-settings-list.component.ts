import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { Observable } from 'rxjs';
import { TaxSettings } from 'src/app/modules/accounting/models/APIModels';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';

@Component({
  selector: 'app-tax-settings-list',

  templateUrl: './tax-settings-list.component.html',
  styleUrl: './tax-settings-list.component.css'
})
export class TaxSettingsListComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  taxList$: Observable<TaxSettings[]> | undefined;



  private readonly router = inject(Router);
  private readonly periodoService = inject(PeriodService);


  ngOnInit(): void {
    this.taxList$ = this.periodoService.getAllTaxSettings();
  

  }

  onEditTax(e: any) {

    console.log(e);

    this.router.navigate(['/accounting/configuration/tax-settings/update', e.id]);
  }

  goToNewTax = () => {
    this.router.navigate(['/accounting/configuration/tax-settings/create']);
  };


  formatDateInit(rowData: any): string {
    const date = new Date(rowData.creationDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }



}
