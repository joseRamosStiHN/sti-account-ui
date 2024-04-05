import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ModalComponent } from '../../../shared/modal/modal.component';

export interface ItemLista {
  producto: string,
      etiqueta: string,
      cuenta: string,
      cantidad: number,
      precio: number,
      impuestos:number,
      
}


@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, NgSelectModule,MatDatepickerModule
    ,MatNativeDateModule,MatInputModule,MatIconModule,MatButtonModule, MatDialogModule, MatSlideToggleModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})

export class AccountSettingsComponent {

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

  constructor(public dialog: MatDialog) {}

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
    console.log("aqui");
    
    const target = event.target as HTMLElement;
    if (target.textContent !== null && target.textContent !== undefined) {
      const newValue = target.textContent.trim();
      // Usamos una index signature para garantizar que field es una clave válida en ItemLista
      (this.lista[index] as any)[field] = field === 'cantidad' || field === 'precio' ? +newValue : newValue;
    }
  }

  editarCampos(event: Event, index: number, field: keyof ItemLista, selecc:string): void {
    console.log(selecc);
    console.log("aqui2");
    
    
    const target = event.target as HTMLElement;
    if (target.textContent !== null && target.textContent !== undefined) {
      const newValue = target.textContent.trim();
      // Usamos una index signature para garantizar que field es una clave válida en ItemLista
      (this.lista[index] as any)[field] = field === 'cantidad' || field === 'precio' ? +newValue : newValue;
    }
  }


  abrirModal() {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '400px', // Ancho del modal
      data: {} // Puedes pasar datos adicionales al modal si es necesario
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado');
    });
  }

  capturarSeleccion(event: any, i: number) {
    
    this.lista[i].cuenta = event;
  }


  isChecked: boolean = false;

  toggleChanged(event: any) {
    console.log('Valor cambiado:', this.isChecked);
    // Realiza cualquier acción adicional que necesites aquí
  }

}
