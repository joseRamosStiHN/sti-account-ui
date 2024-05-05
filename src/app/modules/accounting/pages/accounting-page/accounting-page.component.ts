import { Component, inject, OnInit } from '@angular/core';
import { NavigationService } from '../../../../shared/navigation.service';

@Component({
  selector: 'app-accounting-page',
  templateUrl: './accounting-page.component.html',
  styleUrl: './accounting-page.component.css',
})
export class AccountingPageComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);

  constructor() {}

  ngOnInit(): void {
    this.navigationService.setNavLinks([
      { label: 'Clientes', path: '/accounting/client-list' },
      { label: 'Proveedores', path: '/accounting/provider-list' },
      { label: 'Reportes', path: '/accounting/reports' },
      { label: 'Configuraciones', path: '/accounting/configuration' },
      { label: 'Configuración Cuentas', path: '/accounting/configuration-account' },
    ]);
  }
}
