import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService, NavStiLink } from '../navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  nav: NavStiLink[] = [];

  // nombreUsuario: string = 'Josue Rodriguez';

  // tieneFotoPerfil: boolean = false;

  // iniciales?: string;

  constructor(private navigate: NavigationService) {}

  ngOnInit(): void {
    /*     // Calcular iniciales
    const nombreDividido = this.nombreUsuario.split(' ');
    const primerNombre = nombreDividido[0][0];
    const apellido = nombreDividido[nombreDividido.length - 1];
    const primerApellido = apellido ? apellido[0] : ''; // Verificar si hay apellido
    this.iniciales = (primerNombre + primerApellido).toUpperCase(); */

    this.subscription.add(
      this.navigate.navLinks$.subscribe((links) => {
        this.nav = links;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
