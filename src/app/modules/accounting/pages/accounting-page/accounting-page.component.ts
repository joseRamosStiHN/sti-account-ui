import { Component, inject, OnInit } from '@angular/core';
import { NavigationService } from '../../../../shared/navigation.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-accounting-page',
  templateUrl: './accounting-page.component.html',
  styleUrl: './accounting-page.component.css',
})
export class AccountingPageComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly userService = inject(UsersService);

  navegation: any = []

  user?: UsersResponse;

  constructor() { }

  async ngOnInit() {
    try {

      const savedUser = localStorage.getItem('userData');
      const company = JSON.parse(localStorage.getItem('company') || '');
  
      if (!savedUser || company == '') {
        console.error('Datos de usuario o compañía no encontrados.');
        return;
      }
  
      this.navigationService.setNameCompany(company.company);
  
      const usuario = JSON.parse(savedUser);
  
      this.user = await firstValueFrom(this.userService.getUSerById(usuario.id));
  
      const companyRole =  await this.user.companies.find((com: any) => com.company.id === company.company.id);
  
      if (!companyRole) {
        console.error('No se encontró un rol para la compañía especificada.');
        console.log('company.id:', company.id); 
        console.log('this.user.companies:', this.user.companies);
        return;
      }
  
      const contabilidadList: any = [];

      companyRole.roles.forEach((role: any) => {
        if (role.name === 'REGISTRO CONTABLE' || role.name === 'CONSULTA') {
          this.agregarElementoSiNoExiste(this.navegation, { label: 'Ingresos', path: '/accounting/client-list' });
          this.agregarElementoSiNoExiste(this.navegation, { label: 'Compras', path: '/accounting/provider-list' });
        }
  
        if (role.name === 'CONSULTA') {
          this.agregarElementoSiNoExiste(this.navegation, {
            label: 'Reportes',
            path: '',
            child: [
              { label: 'Balance General', path: '/accounting/report/general-balance' },
              { label: 'Estado de Resultados', path: '/accounting/report/incomes' },
              { label: 'Mayores Contables', path: '/accounting/report/senior-accountants' },
              { label: 'Balanza de Comprobacion', path: '/accounting/report/trialbalance' },
            ],
          });
  
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Ajustes Contables', path: '/accounting/adjustment-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Credito', path: '/accounting/creditnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Debito', path: '/accounting/debitnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Asientos Contables', path: '/accounting/journal-entries' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Apuntes Contables', path: '/accounting/journal-items' });
        }
  
      
        if (role.name === 'APROBADOR') {
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Ajustes Contables', path: '/accounting/adjustment-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Credito', path: '/accounting/creditnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Debito', path: '/accounting/debitnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Cierre Contable', path: '/accounting/accounting-closing' });
  
          this.agregarElementoSiNoExiste(this.navegation, { label: 'Ingresos', path: '/accounting/client-list' });
          this.agregarElementoSiNoExiste(this.navegation, { label: 'Compras', path: '/accounting/provider-list' });
        }

        if (role.name === 'REGISTRO CONTABLE') {
          this.agregarElementoSiNoExiste(this.navegation, {
            label: 'Configuraciones',
            path: '',
            child: [
              { label: 'Configuración Cuentas', path: '/accounting/configuration/accounts' },
              { label: 'Configuración Periodos', path: '/accounting/configuration/period' },
              { label: 'Configuración Saldos', path: '/accounting/configuration/balance/accounts' },
              { label: 'Configuración Diarios', path: '/accounting/configuration/journal-list' },
              { label: 'Configuración Impuestos', path: '/accounting/configuration/tax-settings' },
              { label: 'Configuración Subida Archivos', path: '/accounting/configuration/bulk-configuration' },
            ],
          });
  
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Ajustes Contables', path: '/accounting/adjustment-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Credito', path: '/accounting/creditnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Debito', path: '/accounting/debitnotes-list' });
          this.agregarElementoSiNoExiste(contabilidadList, { label: 'Subida de Facturas', path: '/accounting/bulk-upload-file' });
        }
      });
  

      this.agregarElementoSiNoExiste(this.navegation, {
        label: 'Contabilidad',
        path: '',
        child: contabilidadList,
      });
  
      this.navigationService.setNavLinks(this.navegation);
  
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }
  
  


  agregarElementoSiNoExiste(lista: any[], elemento: any) {
    const existe = lista.some(item => item.label === elemento.label);
    if (!existe) {
      lista.push(elemento);
    }
  }

  // this.navigationService.setNavLinks([
  //   { label: 'Ingresos', path: '/accounting/client-list' },
  //   { label: 'Compras', path: '/accounting/provider-list' },
  //   {
  //     label: 'Contabilidad',
  //     path: '',
  //     child: [
  //       { label: 'Asientos Contables', path: '/accounting/journal-entries' },
  //       { label: 'Apuntes Contables', path: '/accounting/journal-items' },
  //       { label: 'Ajustes Contables', path: '/accounting/adjustment-list' },
  //       { label: 'Notas de Credito', path: '/accounting/creditnotes-list' },
  //       { label: 'Notas de Debito', path: '/accounting/debitnotes-list' },
  //       { label: 'Cierre Contable', path: '/accounting/accounting-closing' },
  //       { label: 'Subida de Facturas', path: '/accounting/bulk-upload-file' },

  //     ],
  //   },
  //   {
  //     label: 'Reportes',
  //     path: '',
  //     child: [
  //       {
  //         label: 'Balance General',
  //         path: '/accounting/report/general-balance',
  //       },
  //       { label: 'Estado de Resultados', path: '/accounting/report/incomes' },
  //       {
  //         label: 'Mayores Contables',
  //         path: '/accounting/report/senior-accountants',
  //       },
  //       {
  //         label: 'Balanza de Comprobacion',
  //         path: '/accounting/report/trialbalance',
  //       },
  //     ],
  //   },
  //   {
  //     label: 'Configuraciones',
  //     path: '',
  //     child: [
  //       {
  //         label: 'Configuración Cuentas',
  //         path: '/accounting/configuration/accounts',
  //       },
  //       {
  //         label: 'Configuración Periodos',
  //         path: '/accounting/configuration/period',
  //       },
  //       {
  //         label: 'Configuración Saldos',
  //         path: '/accounting/configuration/balance/accounts',
  //       },
  //       {
  //         label: 'Configuración Diarios',
  //         path: '/accounting/configuration/journal-list',
  //       },
  //       {
  //         label: 'Configuración Impuestos',
  //         path: '/accounting/configuration/tax-settings',
  //       },
  //       {
  //         label: 'Configuración Subida Archivos',
  //         path: '/accounting/configuration/bulk-configuration',
  //       },
  //     ],
  //   },
  // ]);


  // }
}
