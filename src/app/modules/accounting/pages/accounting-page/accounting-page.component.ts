import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../../shared/navigation.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounting-page',
  templateUrl: './accounting-page.component.html',
  styleUrl: './accounting-page.component.css',
})
export class AccountingPageComponent implements OnInit {
  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.navigationService.setNavLinks([
      { label: 'Clientes', path: '/accounting/client-list' },
      { label: 'Proveedores', path: '/accounting/provider-invoicing' },
      { label: 'Reportes', path: '/accounting/provider-invoicing' },
      { label: 'Configuraciones', path: '/accounting/provider-invoicing' },
    ]);
  }
}
