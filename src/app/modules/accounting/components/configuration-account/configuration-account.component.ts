import { Component, inject } from '@angular/core';
import { DxTabPanelTypes } from 'devextreme-angular/ui/tab-panel';
import { AppService, TabPanelItem } from '../../services/app.service';
import { AccountService } from '../../services/account.service';
import { DxButtonTypes } from 'devextreme-angular/ui/button';

interface AccountList {
  id: number;
  code: string;
  description: string;
  parentId: number;
  category: number;
  typicalBalance?: string | null;
  supportsRegistration?: boolean | null;
  status: string;
}

@Component({
  selector: 'app-configuration-account',
  templateUrl: './configuration-account.component.html',
  styleUrl: './configuration-account.component.css',
})
export class ConfigurationAccountComponent {
  cuentasBancarias = [
    { nombre: 'Activo Corriente', seleccionada: true },
    { nombre: 'Efectivo y Equivalentes', seleccionada: false },
    { nombre: 'Caja', seleccionada: false },
    { nombre: 'Caja Chica ( Inst. Descentralizadas)', seleccionada: false },
    { nombre: 'Caja General', seleccionada: false },
    { nombre: 'Bancos', seleccionada: false },
    { nombre: 'Cuenta Unica de Tesorería (CUT)', seleccionada: false },
    { nombre: 'Cuentas por Cobrar a largo plazo', seleccionada: false },
  ];

  dataSource: TabPanelItem[];

  tabsPositions: any[] = ['left', 'top', 'right', 'bottom'];

  acountList: AccountList[] = [];

  tabsPosition: any = this.tabsPositions[0];

  stylingModes: any[] = ['secondary', 'primary'];

  stylingMode: any = this.stylingModes[0];

  iconPositions: any[] = ['top', 'start', 'end', 'bottom'];

  iconPosition: any[] = this.iconPositions[0];

  private accountService = inject(AccountService);

  constructor(service: AppService) {
    this.dataSource = service.getItems();
  }

  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe((response: any[]) => {
      console.log(response);

      if (Array.isArray(response)) {
        this.acountList = response;
        console.log(this.acountList);
      } else {
        console.error('Error al obtener datos de cuentas');
      }
    });
  }

  //Modal
  popupVisible = false;

  popupWithScrollViewVisible = false;

  bookButtonOptions: DxButtonTypes.Properties = {
    width: 100,
    text: 'Cerrar',
    type: 'default',
    stylingMode: 'contained',
    onClick: () => {
      this.popupVisible = false;
      this.popupWithScrollViewVisible = false;
    },
  };

  showPopup() {
    this.popupVisible = true;
  }

  showPopupWithScrollView() {
    this.popupWithScrollViewVisible = true;
  }

  // Método para manejar la selección de una cuenta bancaria
  toggleSeleccion(index: number) {
    this.cuentasBancarias[index].seleccionada =
      !this.cuentasBancarias[index].seleccionada;
  }
}
