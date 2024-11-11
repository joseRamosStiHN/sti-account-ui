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
      { label: 'Ingresos', path: '/accounting/client-list' },
      { label: 'Compras', path: '/accounting/provider-list' },
      {
        label: 'Contabilidad',
        path: '',
        child: [
          { label: 'Asientos Contables', path: '/accounting/journal-entries' },
          { label: 'Apuntes Contables', path: '/accounting/journal-items' },
          { label: 'Ajustes Contables', path: '/accounting/adjustment-list' },
          { label: 'Notas de Credito', path: '/accounting/creditnotes-list' },
          { label: 'Notas de Debito', path: '/accounting/debitnotes-list' },
          { label: 'Cierre Contable', path: '/accounting/accounting-closing' },
       
        ],
      },
      {
        label: 'Reportes',
        path: '',
        child: [
          {
            label: 'Balance General',
            path: '/accounting/report/general-balance',
          },
          { label: 'Estado de Resultados', path: '/accounting/report/incomes' },
          {
            label: 'Mayores Contables',
            path: '/accounting/report/senior-accountants',
          },
          {
            label: 'Balanza de Comprobacion',
            path: '/accounting/report/trialbalance',
          },
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
          {
            label: 'Configuración Diarios',
            path: '/accounting/configuration/journal-list',
          },
          {
            label: 'Configuración Impuestos',
            path: '/accounting/configuration/tax-settings',
          },
        ],
      },
    ]);
  }
}
