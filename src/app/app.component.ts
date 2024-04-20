import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';

import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import { AccountingModule } from './modules/accounting/accounting.module';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    RouterModule,
    BreadcrumbComponent,
    BreadcrumbItemDirective,
    AccountingModule,
  ],
})
export class AppComponent {
  title = 'Módulo contabilidad';

  constructor() {
    loadMessages(esMessages);
    locale('es-HN');
  }
}
