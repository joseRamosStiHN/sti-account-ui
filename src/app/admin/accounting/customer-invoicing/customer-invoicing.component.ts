import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog'; // Importa MatDialog
import { MatIconModule } from '@angular/material/icon';

export interface ItemLista {
  producto: string,
  etiqueta: string,
  cuenta: string,
  cantidad: string,
  precio: string,
  impuestos: string,

}

@Component({
  selector: 'app-customer-invoicing',
  standalone: true,
  imports: [CommonModule, NgSelectModule, MatDatepickerModule
    , MatNativeDateModule, MatInputModule, MatIconModule],
  templateUrl: './customer-invoicing.component.html',
  styleUrl: './customer-invoicing.component.css'
})
export class CustomerInvoicingComponent {

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  seleccionado: any;
  displayedColumns: string[] = ['nombre', 'apellido', 'edad', 'acciones'];


  total: number = 0;



  data = [{ nombre: '', apellido: '', edad: null }];


  clientes = [{ id: 1, cliente: 'Josue Rodriguez' }, { id: 2, cliente: 'Valeria Rodriguez' }]

  public editing = false;

  lista: ItemLista[] = [
    {
      producto: '',
      etiqueta: '',
      cuenta: '',
      cantidad: '',
      precio: '',
      impuestos: '',

    },

  ];

  eliminar(row: number): void {
    if (confirm("¿Seguro que desea eliminar?")) {
      this.lista.splice(row, 1);

      this.total = 0;
      this.lista.forEach((item) => {

        this.total = this.total + ((Number(item.cantidad) * Number(item.precio)) + Number(item.impuestos));
      })
    }
  }

  agregar(): void {
    this.lista.push({
      producto: '',
      etiqueta: '',
      cuenta: '',
      cantidad: '',
      precio: '',
      impuestos: '',
    });

    const tableContainer = document.querySelector('.panel-body');

    if (tableContainer) {
      const maxScrollTop = tableContainer.scrollHeight - tableContainer.clientHeight;
      tableContainer.scrollBy({
        top: maxScrollTop,
        left: 0,
        behavior: "smooth",
      });
    }

    this.total = 0;

    this.lista.forEach((item) => {



      this.total = this.total + ((Number(item.cantidad) * Number(item.precio)) + Number(item.impuestos));

    })

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

      this.total = 0;

      this.lista.forEach((item) => {

       
      this.total = this.total + ((Number(item.cantidad) * Number(item.precio)) + Number(item.impuestos));

      })
    }
  }

  editarCampos(event: Event, index: number, field: keyof ItemLista, selecc: string): void {



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
