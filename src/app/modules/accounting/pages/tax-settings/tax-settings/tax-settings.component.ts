import { Component, inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TaxSettings } from 'src/app/modules/accounting/models/APIModels';
import { confirm } from 'devextreme/ui/dialog';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { typeToast } from 'src/app/modules/accounting/models/models';
import { ToastType } from 'devextreme/ui/toast';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-tax-settings',
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.css',
  providers: [DecimalPipe]
})
export class TaxSettingsComponent {
  @Input('id') id?: string;
  taxSetings: TaxSettings;
  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;
  onward: boolean = false;
  existingRanges: any[] = [];

  private readonly router = inject(Router);
  private readonly periodService = inject(PeriodService);
  private readonly decimalPipe = inject(DecimalPipe);

  constructor() {
    this.taxSetings = {
      taxRate: "",
      fromValue: null,
      toValue: null,
      isCurrent: true,
      percent: null,
      type: ""
    };
  }

  ngOnInit(): void {
    this.loadExistingRanges();

    const findId = Number(this.id);
    if (findId) {
      this.periodService.getTaxById(findId).subscribe({
        next: (tax) => {
          if (tax.taxRate?.toLowerCase() === 'exentos' || tax.taxRate?.toLowerCase() === 'excentos') {
            tax.taxRate = 'Exentos';
            tax.percent = null;
          } else {
            tax.taxRate = 'Gravado';
            tax.percent = Number(tax.taxRate);
          }

          this.taxSetings = tax;
        },
        error: (err) => {
          this.toastType = typeToast.Error;
          this.messageToast = 'Ups error al obtener datos del impuesto';
          this.showToast = true;
          console.error('Error al obtener datos impuesto', err);
          this.redirectTo();
        }
      });
    }
  }

  loadExistingRanges() {
    this.periodService.getAllTaxSettings().subscribe({
      next: (data) => {
        this.existingRanges = data
          .filter(item => item.id !== Number(this.id))
          .map(item => ({
            from: item.fromValue,
            to: item.toValue,
            type: item.type
          }));
      },
      error: (err) => {
        console.error('Error al cargar rangos existentes', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/accounting/configuration/tax-settings']);
  }

  async save(e: NgForm) {

    if (!e.valid) {
      this.toastType = typeToast.Error;
      this.messageToast = 'Por favor, complete los campos requeridos.';
      this.showToast = true;
      return;
    }

    // Validación 2: Desde no puede ser mayor que Hasta (excepto cuando es "En adelante")
    if (!this.onward && this.taxSetings.fromValue && this.taxSetings.toValue &&
      this.taxSetings.fromValue > this.taxSetings.toValue) {
      this.toastType = typeToast.Error;
      this.messageToast = 'El valor Hasta no puede ser menor que el valor Desde.';
      this.showToast = true;
      return;
    }

    // Validación 3: Verificar solapamiento de rangos
    if (!this.validateRangeOverlap()) {
      this.toastType = typeToast.Error;
      this.messageToast = 'El rango se solapa con uno existente. Ajuste los valores.';
      this.showToast = true;
      return;
    }

    if (e.valid) {
      let dialogo = await confirm(`¿Está seguro de que desea realizar esta acción?`, 'Advertencia');
      if (!dialogo) {
        return;
      }

      const { taxRate, percent, ...otherSettings } = this.taxSetings;
      const request = {
        taxRate: taxRate === 'Exentos' ? 'Exentos' : (percent?.toString() || ''),
        ...otherSettings
      };


      if (this.id) {
        this.updateTax(request);
      } else {
        this.createTax(request);
      }
    }
  }

  validateRangeOverlap(): boolean {
    if (!this.taxSetings.type || !this.taxSetings.fromValue) {
      return true;
    }

    const newFrom = this.taxSetings.fromValue;

    let newTo: number;
    if (this.onward) {
      newTo = Infinity;
    } else {
      if (this.taxSetings.toValue === null) {
        return false;
      }
      newTo = this.taxSetings.toValue;
    }

    for (const range of this.existingRanges) {
      if (range.type === this.taxSetings.type) {
        const existingFrom = range.from ?? 0;
        const existingTo = range.to === null ? Infinity : range.to;

        if ((newFrom >= existingFrom && newFrom <= existingTo) ||
          (newTo >= existingFrom && newTo <= existingTo) ||
          (newFrom <= existingFrom && newTo >= existingTo)) {
          return false;
        }
      }
    }

    return true;
  }

  updateTax(request: TaxSettings) {
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
        console.error('Error updating tax:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al actualizar el impuesto';
        this.showToast = true;
      },
    });
  }

  createTax(request: TaxSettings) {
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

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '';
    return this.decimalPipe.transform(value, '1.0-2', 'en-US') || '';
  }

  formatFromInput(field: 'fromValue' | 'toValue') {
    const input = document.getElementById(field) as HTMLInputElement;
    input.value = this.formatNumber(this.taxSetings[field]);
  }

  blockInvalidKeys(event: KeyboardEvent) {
    const invalid = ['-', 'e', 'E', '+'];
    if (invalid.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Fuerza no-negativo y máximo 2 decimales
  enforceNonNegativeTwoDecimals(field: 'fromValue' | 'toValue') {
    let v: any = this.taxSetings[field];
    if (v === null || v === undefined || v === '') return;

    let num = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(num)) { this.taxSetings[field] = null as any; return; }

    if (num < 0) num = 0;

    num = Math.floor(num * 100) / 100;

    this.taxSetings[field] = num;
  }


}