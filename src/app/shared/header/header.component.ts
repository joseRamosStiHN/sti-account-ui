import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  public nombreUsuario: string = "Josue Rodriguez";

  tieneFotoPerfil: boolean = false;

  iniciales?: string;


  ngOnInit(): void {
    
    // Calcular iniciales
    const nombreDividido = this.nombreUsuario.split(' ');
    const primerNombre = nombreDividido[0][0];
    const apellido = nombreDividido[nombreDividido.length - 1];
    const primerApellido = apellido ? apellido[0] : ''; // Verificar si hay apellido
    this.iniciales = (primerNombre + primerApellido).toUpperCase();
  }

}
