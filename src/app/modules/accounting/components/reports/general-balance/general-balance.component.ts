import { Component, OnInit } from '@angular/core';

import { DxTreeListTypes } from 'devextreme-angular/ui/tree-list';

interface GeneralBance {
  id: number;
  parentId: number | null;
  accountName: string;
  category: string;
  amount: number;
  total: number | null;
  isRoot: boolean;
}
export interface GeneralBalance2 {
  accountName: string;
  id: number;
  parentId: number | null;
  category: string;
  amount: number;
  total: number | null;
  isRoot: boolean;
  children?: GeneralBalance2[];
  isCollapsed: boolean;
  depth: number;
}

const DATA: GeneralBance[] = [
  {
    accountName: 'Activo',
    id: 1,
    parentId: null,
    category: 'Activo',
    amount: 0,
    isRoot: true,
    total: null,
  },
  {
    accountName: 'Activo Corriente',
    id: 2,
    parentId: 1,
    category: 'Activo',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Efectivo y Equipamiento',
    id: 3,
    parentId: 2,
    category: 'Activo',
    amount: 1000,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Deposito a Plazo',
    id: 20,
    parentId: 2,
    category: 'Activo',
    amount: 1200,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Activo No Corriente',
    id: 4,
    parentId: 1,
    category: 'Activo',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Otros Activo',
    id: 25,
    parentId: 2,
    category: 'Activo',
    amount: -250,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Propiedad Planta y Equipo',
    id: 21,
    parentId: 4,
    category: 'Activo',
    amount: 1020.79,
    total: null,
    isRoot: false,
  },

  {
    accountName: 'Pasivo',
    id: 50,
    parentId: null,
    category: 'Pasivo',
    amount: 0,
    total: null,
    isRoot: true,
  },
  {
    accountName: 'Pasivo Corriente',
    id: 51,
    parentId: 50,
    category: 'Pasivo',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Pasivo Financiero',
    id: 52,
    parentId: 51,
    category: 'Pasivo',
    amount: 100.21,
    total: null,
    isRoot: false,
  },
  {
    accountName: 'Cuentas Por Pagar',
    id: 53,
    parentId: 51,
    category: 'Pasivo',
    amount: 1800,
    total: null,
    isRoot: false,
  },
  {
    id: 60,
    parentId: null,
    accountName: 'Patrimonio',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    isRoot: true,
  },
  {
    id: 61,
    parentId: 60,
    accountName: 'Patrimonio',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    id: 62,
    parentId: 61,
    accountName: 'Capital Social',
    category: 'Patrimonio',
    amount: 20.58,
    total: null,
    isRoot: false,
  },
  {
    id: 63,
    parentId: 61,
    accountName: 'Ganancias Acumuladas',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    id: 64,
    parentId: 63,
    accountName: 'Acumulado de',
    category: 'Patrimonio',
    amount: 1000,
    total: null,
    isRoot: false,
  },
  {
    id: 65,
    parentId: 63,
    accountName: 'mass acumulado',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    id: 66,
    parentId: 65,
    accountName: 'Tes acumulado',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    isRoot: false,
  },
  {
    id: 67,
    parentId: 66,
    accountName: 'anidado mas profundo',
    category: 'Patrimonio',
    amount: 50,
    total: null,
    isRoot: false,
  },
];

@Component({
  selector: 'app-general-balance',
  templateUrl: './general-balance.component.html',
  styleUrl: './general-balance.component.css',
})
export class GeneralBalanceComponent implements OnInit {
  dataSource: GeneralBance[] = [];
  treeData: GeneralBalance2[] = [];
  values: any = [];
  summaryTotal: number = 0;
  ngOnInit(): void {
    this.buildTree();
    this.calculateSummary();
    // this.dataSource = DATA;
    //  this.test();
  }

  onContentReady(e: any): void {
    if (e.isNotFirstLoad) return;
    e.isNotFirstLoad = true;
    //console.log(e.component.getRootNode());
    // this.getSummary(e.component.getRootNode());
  }
  onRowPrepared(e: DxTreeListTypes.RowPreparedEvent) {
    // console.log(e.component.getRootNode());
  }

  buildTree(): void {
    const tree = new Map<number, GeneralBalance2>();
    DATA.forEach((item) => {
      tree.set(item.id, {
        ...item,
        isCollapsed: true,
        depth: 0,
        children: [],
      });
    });

    DATA.forEach((item) => {
      if (item.parentId !== null) {
        const parent = tree.get(item.parentId);
        if (tree.get(item.id)) {
          parent?.children?.push(tree.get(item.id)!);
        }
      } else {
        this.treeData.push(tree.get(item.id)!);
      }
    });

    // Create total nodes for each parent node
    this.treeData.forEach((root) => {
      // this.createTotalNodes(root);
      this.calculateTotals(root);
      this.assignDepth(this.treeData, 0);
    });
  }

  assignDepth(nodes: GeneralBalance2[], depth: number): void {
    nodes.forEach((node) => {
      node.depth = depth;
      if (node.children && node.children.length > 0) {
        this.assignDepth(node.children, depth + 1); // Aumenta la profundidad para los hijos
      }
    });
  }

  calculateSummary(): void {
    this.summaryTotal = 0;
    // Sumar todos los nodos raíz con categorías específicas
    this.treeData.forEach((root) => {
      if (root.category === 'Pasivo' || root.category === 'Patrimonio') {
        this.summaryTotal += root.total ?? 0;
      }
    });
  }

  createTotalNodes(node: GeneralBalance2): void {
    /*  node.children?.length;
    if (node.children?.length && node.children?.length > 0) {
      let total = 0;
      node.children.forEach((child) => {
        this.createTotalNodes(child);
        total += child.total ?? 0;
      });

      const totalNode: GeneralBalance2 = {
        accountName: 'Total of ' + node.accountName,
        id: -Math.random(),
        parentId: node.id,
        category: node.category,
        amount: total,
        total: total,
        isRoot: false,
        isCollapsed: false,
        children: [],
      };
      node.children.push(totalNode);
      node.total = total;
    } else {
      node.total = node.amount;
    } */
  }

  checkChildren(node?: GeneralBalance2[]) {
    return Array.isArray(node) && node.length > 0;
  }

  toggleCollapse(node: GeneralBalance2): void {
    node.isCollapsed = !node.isCollapsed;
  }

  calculateTotals(node: GeneralBalance2): number {
    if (!node.children || node.children.length === 0) {
      node.total = node.amount;
      return node.amount;
    }

    const childrenTotal = node.children.reduce((acc, child) => {
      return acc + this.calculateTotals(child);
    }, 0);

    node.total = childrenTotal;
    return childrenTotal;
  }

  private test() {
    const map = new Map<number, number>();
    DATA.forEach((v) => {
      if (!v.isRoot && v.parentId !== null) {
        const currentAmount = map.get(v.parentId) || 0;
        map.set(v.parentId, currentAmount + v.amount);
      }
    });
    DATA.forEach((item) => {
      if (!item.isRoot && map.has(item.id)) {
        item.total = map.get(item.id) as number;
      }
    });
  }
}
