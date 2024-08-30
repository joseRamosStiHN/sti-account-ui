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
      {
        label: 'Reportes',
        path: '',
        child: [
          {
            label: 'Balance General',
            path: '/accounting/report/general-balance',
          },
          { label: 'Estado de Resultados', path: '/accounting/report/incomes' },
        ],
      },
      {
        label: 'Configuraciones',
        path: '',
        child: [
          {
            label: 'Configuración Cuentas',
            path: '/accounting/configuration/accounts',
          },
          {
            label: 'Configuración Periodos',
            path: '/accounting/configuration/period',
          },
          {
            label: 'Configuración Saldos',
            path: '/accounting/configuration/balance/accounts',
          },
        ],
      },
    ]);
  }
}
