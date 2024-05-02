import { Component } from '@angular/core';
import { DxTabPanelModule, DxTabPanelTypes } from 'devextreme-angular/ui/tab-panel';
import { AppService, TabPanelItem } from '../../services/app.service';
import { DxCheckBoxModule, DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuration-account',
  standalone: true,
  imports: [   CommonModule, DxTabPanelModule, DxCheckBoxModule, DxSelectBoxModule, DxTemplateModule],
  templateUrl: './configuration-account.component.html',
  styleUrl: './configuration-account.component.css'
})
export class ConfigurationAccountComponent {

  dataSource: TabPanelItem[];

  tabsPositions: DxTabPanelTypes.Position[] = [
    'left', 'top', 'right', 'bottom',
  ];

  tabsPosition: DxTabPanelTypes.Position = this.tabsPositions[0];

  stylingModes: DxTabPanelTypes.TabsStyle[] = ['secondary', 'primary'];

  stylingMode: DxTabPanelTypes.TabsStyle = this.stylingModes[0];

  iconPositions: DxTabPanelTypes.TabsIconPosition[] = [
    'top', 'start', 'end', 'bottom',
  ];

  iconPosition: DxTabPanelTypes.TabsIconPosition = this.iconPositions[0];

  constructor(service: AppService) {
    this.dataSource = service.getItems();
  }

  getTaskItemClasses(priority: string) {
    return `task-item task-item-priority-${priority}`;
  }
}
