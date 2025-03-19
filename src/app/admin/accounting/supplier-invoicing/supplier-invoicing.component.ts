import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { NgSelectModule } from '@ng-select/ng-select';

export interface ItemLista {
  producto: string,
      etiqueta: string,
      cuenta: string,
      cantidad: number,
      precio: number,
      impuestos:number,
      
}


@Component({
  selector: 'app-supplier-invoicing',
  standalone: true,
  imports: [ CommonModule, NgSelectModule,MatDatepickerModule
    ,MatNativeDateModule,MatInputModule,MatIconModule],
  templateUrl: './supplier-invoicing.component.html',
  styleUrl: './supplier-invoicing.component.css'
})
export class SupplierInvoicingComponent {

  seleccionado: any;
  displayedColumns: string[] = ['nombre', 'apellido', 'edad', 'acciones'];

 

  data = [{ nombre: '', apellido: '', edad: null }];


  clientes = [{id:1,cliente:'Josue Rodriguez'},{id:2,cliente:'Valeria Rodriguez'}]

  public editing = false;

  lista: ItemLista[] = [
    {
      producto: '',
      etiqueta: '',
      cuenta: '',
      cantidad: 0,
      precio: 0,
      impuestos:0,
      
    },
    
  ];

  eliminar(row: number): void {
    if (confirm("¿Seguro que desea eliminar?")) {
      this.lista.splice(row, 1);
    }
  }

  agregar(): void {
    this.lista.push({producto: '',
    etiqueta: '',
    cuenta: '',
    cantidad: 0,
    precio: 0,
    impuestos:0,
  });
  }

  recuperarValores(): void {
    console.log(this.lista);
    document.getElementById('JSON')!.textContent = JSON.stringify(this.lista);
  }

  editarCampo(event: Event, index: number, field: keyof ItemLista): void {
 
    
    const target = event.target as HTMLElement;
    if (target.textContent !== null && target.textContent !== undefined) {

      
      const newValue = target.textContent.trim();
      (this.lista[index] as any)[field] = field === 'cantidad' || field === 'precio' ? +newValue : newValue;
    }
  }

  editarCampos(event: Event, index: number, field: keyof ItemLista, selecc:string): void {
    
 
    
    const target = event.target as HTMLElement;
    if (target.textContent !== null && target.textContent !== undefined) {
      const newValue = target.textContent.trim();
      (this.lista[index] as any)[field] = field === 'cantidad' || field === 'precio' ? +newValue : newValue;
    }
  }

  capturarSeleccion(event: any, i: number) {
    
    this.lista[i].cuenta = event;
  }


  
}
