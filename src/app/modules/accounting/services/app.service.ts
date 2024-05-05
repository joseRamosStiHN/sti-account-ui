import { Injectable } from '@angular/core';


export class Task {
  status: string | undefined;

  priority: string | undefined;

  text: string | undefined;

  date: string | undefined;

  assignedBy: string | undefined;
}

export class TabPanelItem {
  icon: string | undefined;

  title: string | undefined;

  tasks: Task[] | undefined;
}

const tasks: Task[] = [
  
];

export const dataSource: TabPanelItem[] = [
  {
    icon: 'description',
    title: 'Facturas Clientes',
    tasks: tasks.filter((item) => item.status === 'Not Started'),
  },
  {
    icon: 'taskhelpneeded',
    title: 'Facturas Proveedores',
    tasks: tasks.filter((item) => item.status === 'Help Needed'),
  },
  {
    icon: 'taskinprogress',
    title: 'Nota de Credito',
    tasks: tasks.filter((item) => item.status === 'In Progress'),
  },
  {
    icon: 'taskstop',
    title: 'Nota de debito',
    tasks: tasks.filter((item) => item.status === 'Deferred'),
  }
];

@Injectable({
  providedIn: 'root'
})
export class AppService {
  getItems(): TabPanelItem[] {
    return dataSource;
  }
}
