import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';

import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import { AccountingModule } from './modules/accounting/accounting.module';
import { CompaniesModule } from 'src/app/modules/companies/companies.module';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, CommonModule, RouterModule],
})
export class AppComponent {
  title = 'Módulo contabilidad';

  constructor() {
    loadMessages(esMessages);
    locale('es-HN');
  }
}
