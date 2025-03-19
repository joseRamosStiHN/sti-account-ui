import { Component, inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TaxSettings } from 'src/app/modules/accounting/models/APIModels';
import { confirm } from 'devextreme/ui/dialog';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';

@Component({
  selector: 'app-tax-settings',
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.css'
})
export class TaxSettingsComponent {

  @Input('id') id?: string;


  taxSetings: TaxSettings;


  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;


  private readonly router = inject(Router);
  private readonly periodService = inject(PeriodService);

  constructor() {
    this.taxSetings = {
     taxRate:"",
     fromValue:null,
     toValue:null,
     isCurrent:true,
     percent:null,
     type:""
    };
  }

  ngOnInit(): void {

    const findId = Number(this.id);
    if (findId) {
      this.periodService.getTaxById(findId).subscribe({   
        next:(tax)=>{
      
          tax.percent= tax.taxRate =="Excentos"?null: Number(tax.taxRate);
          tax.taxRate= tax.taxRate !="Excentos"? "Gravado": tax.taxRate;
          this.taxSetings = tax;

        },
        error:(err)=>{
          this.toastType = typeToast.Error;
          this.messageToast = 'Ups error al obtener datos del impuesto';
          this.showToast = true;
          console.error('Error al obtener datos impuesto', err)
          this.redirectTo();
        }
      }
      );
    }

  }

  goBack() {
    this.router.navigate(['/accounting/configuration/tax-settings']);
  }




  async save(e: NgForm) {
    console.log(e.valid);
    
    if (e.valid ) {
      let dialogo = await confirm(`¿Está seguro de que desea realizar esta acción?`, 'Advertencia');
      if (!dialogo) {
        return;
      }

      const { taxRate, percent, ...otherSettings } = this.taxSetings;

      const request = {
        taxRate: taxRate === "Excentos" ? "Excentos" : percent?.toString() || "",
        ...otherSettings
      };
  
  

      if (this.id) {
        this.updateTax(request);
      } else {
        this.createTax(request);
      }
    };

  }


  updateTax(request:TaxSettings) {
   
    this.periodService.updateTax(Number(this.id), request).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros actualizados exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 1000);
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al actualizar el impuesto';
        this.showToast = true;
      },
    });
  }

  createTax(request:TaxSettings) {
    console.log(request);
    
    this.periodService.createTaxSettings(request).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros insertados exitosamente';
        this.showToast = true;
        setTimeout(() => {
          this.goBack();
        }, 3000);

      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el Impuesto';
        this.showToast = true;
      },
    });
  }

  redirectTo() {
    setTimeout(() => {
      this.goBack();
    }, 2000);
  }



  validateDecimal(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.charCode);
    const currentValue = (event.target as HTMLInputElement).value;
    if (!/^\d*\.?\d*$/.test(inputChar)) {
      event.preventDefault();
      return;
    }
    if (inputChar === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }
    if (currentValue.includes('.') && currentValue.split('.')[1].length >= 2) {
      event.preventDefault();
    }
  }



}
