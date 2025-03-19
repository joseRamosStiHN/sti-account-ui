import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService, NavStiLink } from '../navigation.service';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule,
    DropdownComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  nav: NavStiLink[] = [];
  dropdownOpen = false;
    private readonly navigationService = inject(NavigationService);
    private authService = inject(AuthServiceService);

    companyId?: number

  // nombreUsuario: string = 'Josue Rodriguez';

  // tieneFotoPerfil: boolean = false;

  // iniciales?: string;

  nameCompany?:string

  constructor(private navigate: NavigationService, private router: Router) {}

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

    // To Do cargar imagen en header

    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company)=>{
        this.nameCompany = company.name
        this.companyId = company.id
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goBack() {
    localStorage.removeItem('company'); 
    this.router.navigate(['/dashboard']);      
    this.dropdownOpen = false;        
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {      
        localStorage.removeItem('userData'); 
        localStorage.removeItem('company');
        this.authService.setLogin({
          userName: '',
          active: false,
          companies: [],
          createdAt: new Date(),
          email: '',
          firstName: '',
          id: 0,
          lastName: '',
          globalRoles: []
        });
    
        this.dropdownOpen = false;        
        this.router.navigate(['/login']);    
      },
      error: (err) => {

        console.log(err.error);
        
        console.log(err);
      }
    });
  }
}
