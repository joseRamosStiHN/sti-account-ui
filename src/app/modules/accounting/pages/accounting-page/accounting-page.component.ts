import { Component, inject, OnInit } from '@angular/core';
import { NavigationService } from '../../../../shared/navigation.service';
import { UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';
import { UsersService } from 'src/app/modules/users/users.service';
import { firstValueFrom, of, Subscription } from 'rxjs';
import { CompaniesService } from 'src/app/modules/companies/companies.service';
import { Company } from 'src/app/shared/models/LoginResponseModel';
@Component({
  selector: 'app-accounting-page',
  templateUrl: './accounting-page.component.html',
  styleUrl: './accounting-page.component.css',
})
export class AccountingPageComponent implements OnInit {

  private subscription: Subscription = new Subscription();

  private readonly navigationService = inject(NavigationService);
  private readonly companyService = inject(CompaniesService);

  navegation: any = []

  user?: UsersResponse;

  constructor() { }

  async ngOnInit() {

    const contabilidadList: any = [];

    this.subscription.add(
      
      this.companyService.companyLogin$.subscribe((companie) => {        
        try {
        
          this.navigationService.setCompany(companie);
          
    
          companie?.roles.forEach((role: any) => {
            
            if (role.name === 'REGISTRO CONTABLE' || role.name === 'CONSULTA') {
              this.agregarElementoSiNoExiste(this.navegation, { id: 1, label: 'Ingresos', path: '/accounting/client-list' });
              this.agregarElementoSiNoExiste(this.navegation, { id: 2, label: 'Compras', path: '/accounting/provider-list' });
            }
    
            if (role.name === 'CONSULTA') {
              this.agregarElementoSiNoExiste(this.navegation, {
                id: 4,
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
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Crédito', path: '/accounting/creditnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Débito', path: '/accounting/debitnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Asientos Contables', path: '/accounting/journal-entries' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Apuntes Contables', path: '/accounting/journal-items' });
            }
    
     
            
    
            if (role.name === 'APROBADOR') {
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Ajustes Contables', path: '/accounting/adjustment-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Crédito', path: '/accounting/creditnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Débito', path: '/accounting/debitnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Cierre Contable', path: '/accounting/accounting-closing' });
    
              this.agregarElementoSiNoExiste(this.navegation, { id: 1, label: 'Ingresos', path: '/accounting/client-list' });
              this.agregarElementoSiNoExiste(this.navegation, { id: 2, label: 'Compras', path: '/accounting/provider-list' });
            }
    
            if (role.name === 'REGISTRO CONTABLE') {
              this.agregarElementoSiNoExiste(this.navegation, {
                id: 5,
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
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Crédito', path: '/accounting/creditnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Notas de Débito', path: '/accounting/debitnotes-list' });
              this.agregarElementoSiNoExiste(contabilidadList, { label: 'Subida de Facturas', path: '/accounting/bulk-upload-file' });
            }
          });
    
    
          this.agregarElementoSiNoExiste(this.navegation, {
            id: 3,
            label: 'Contabilidad',
            path: '',
            child: contabilidadList,
          });
    
          this.navigationService.setNavLinks(this.navegation.sort((a: any, b: any) => a.id - b.id));
    
        } catch (error) {
          console.error('Error al obtener los datos del usuario:', error);
        }
      })
    );

   
  }




  agregarElementoSiNoExiste(lista: any[], elemento: any) {
    const existe = lista.some(item => item.label === elemento.label);
    if (!existe) {
      lista.push(elemento);
    }
  }


}
