import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastType } from 'devextreme/ui/toast';
import { map, Observable } from 'rxjs';
import { UploadBulkSettings } from 'src/app/modules/accounting/models/APIModels';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { UploadBulkService } from 'src/app/modules/accounting/services/upload-bulk.service';


@Component({
  selector: 'app-bulk-configuration-list',
  templateUrl: './bulk-configuration-list.component.html',
  styleUrl: './bulk-configuration-list.component.css'
})
export class BulkConfigurationListComponent {


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  bulkSettingList$: Observable<any> | undefined;



  private readonly router = inject(Router);
  private readonly periodoService = inject(UploadBulkService);


  ngOnInit(): void {
 this.bulkSettingList$ = this.periodoService.getAllBulkSettings().pipe(
      map(data=> {
       return data.map(bulk=>{
          const typeSale = bulk.type == 1 ? "Venta": "Compra";          
          return { typeSale, ...bulk}

        })
      })
    );

  }

  onEditUploadBulk(e: any) {
    this.router.navigate(['/accounting/configuration/bulk-configuration', e.id]);
  }

  goToNewUploadBulk = () => {
    this.router.navigate(['/accounting/configuration/bulk-configuration/create']);
  };

}
