import { Component, inject } from '@angular/core';
import { DxTabPanelModule, DxTabPanelTypes } from 'devextreme-angular/ui/tab-panel';
import { AppService, TabPanelItem } from '../../services/app.service';
import { DxCheckBoxModule, DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
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
  styleUrl: './configuration-account.component.css'
})
export class ConfigurationAccountComponent {

  dataSource: TabPanelItem[];


  tabsPositions: DxTabPanelTypes.Position[] = [
    'left', 'top', 'right', 'bottom',
  ];

  
  acountList: AccountList[] = [];

  tabsPosition: DxTabPanelTypes.Position = this.tabsPositions[0];

  stylingModes: DxTabPanelTypes.TabsStyle[] = ['secondary', 'primary'];

  stylingMode: DxTabPanelTypes.TabsStyle = this.stylingModes[0];

  iconPositions: DxTabPanelTypes.TabsIconPosition[] = [
    'top', 'start', 'end', 'bottom',
  ];

  iconPosition: DxTabPanelTypes.TabsIconPosition = this.iconPositions[0];
  
  private accountService = inject(AccountService);

  constructor(service: AppService) {
    this.dataSource = service.getItems();
  }

  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe((response: any) => {
      if (response.code === 200 && response.data) {
        this.acountList = response.data;
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
    width: 300,
    text: 'Close',
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


  

}
