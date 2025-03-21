import { Component, inject, OnInit } from '@angular/core';

import { DxTreeListTypes } from 'devextreme-angular/ui/tree-list';
import { GeneralBalance, GeneralBalanceResponse } from '../../../models/APIModels';
import { ReportServiceService } from '../../../services/report-service.service';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { map, Observable } from 'rxjs';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { NgForm } from '@angular/forms';
// import * as XLSX from 'xlsx';
import XLSX from "xlsx-js-style";

interface GeneralBalance2 {
  accountName: string;
  id: number;
  parentId: number | null;
  category: string;
  amount: number;
  total: number | null;
  root: boolean;
  children?: GeneralBalance2[];
  isCollapsed: boolean;
  depth: number;
}

const data2: any[] = [
  {
    id: 4,
    accountName: 'Activo Corriente',
    parentId: 1,
    category: 'CREDITO',
    amount: 50.03,
    root: false,
  },
  {
    id: 5,
    accountName: 'Efectivo y Equipo',
    parentId: 4,
    category: 'CREDITO',
    amount: 40.01,
    root: false,
  },
  {
    id: 6,
    accountName: 'Deposito a Plazo',
    parentId: 4,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 7,
    accountName: 'Activo No Corriente',
    parentId: 1,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 8,
    accountName: 'Propiedad Planta y Equipo',
    parentId: 7,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 9,
    accountName: 'Pasivo Corriente',
    parentId: 2,
    category: 'CREDITO',
    amount: -50.0,
    root: false,
  },
  {
    id: 10,
    accountName: 'Pasivo Financiero',
    parentId: 9,
    category: 'CREDITO',
    amount: -40.01,
    root: false,
  },
  {
    id: 11,
    accountName: 'Cuenta x Pagar',
    parentId: 9,
    category: 'CREDITO',
    amount: 10.03,
    root: false,
  },
  {
    id: 12,
    accountName: 'Patrimonio',
    parentId: 3,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 13,
    accountName: 'Capital Social',
    parentId: 12,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 14,
    accountName: 'Ganancias Acumuladas',
    parentId: 12,
    category: 'CREDITO',
    amount: 0.0,
    root: false,
  },
  {
    id: 1,
    accountName: 'Activo',
    parentId: null,
    category: 'CREDITO',
    amount: 50.0,
    root: true,
  },
  {
    id: 2,
    accountName: 'Pasivo',
    parentId: null,
    category: 'CREDITO',
    amount: -50.0,
    root: true,
  },
  {
    id: 3,
    accountName: 'Patrimonio',
    parentId: null,
    category: 'CREDITO',
    amount: 0.0,
    root: true,
  },
];

const DATA: GeneralBalance[] = [
  {
    accountName: 'Activo',
    id: 1,
    parentId: null,
    category: 'Activo',
    amount: 0,
    root: true,
    total: null,
  },
  {
    accountName: 'Activo Corriente',
    id: 2,
    parentId: 1,
    category: 'Activo',
    amount: 0,
    total: null,
    root: false,
  },
  {
    accountName: 'Efectivo y Equipamiento',
    id: 3,
    parentId: 2,
    category: 'Activo',
    amount: 1000,
    total: null,
    root: false,
  },
  {
    accountName: 'Deposito a Plazo',
    id: 20,
    parentId: 2,
    category: 'Activo',
    amount: 1200,
    total: null,
    root: false,
  },
  {
    accountName: 'Activo No Corriente',
    id: 4,
    parentId: 1,
    category: 'Activo',
    amount: 0,
    total: null,
    root: false,
  },
  {
    accountName: 'Otros Activo',
    id: 25,
    parentId: 2,
    category: 'Activo',
    amount: -250,
    total: null,
    root: false,
  },
  {
    accountName: 'Propiedad Planta y Equipo',
    id: 21,
    parentId: 4,
    category: 'Activo',
    amount: 1020.79,
    total: null,
    root: false,
  },

  {
    accountName: 'Pasivo',
    id: 50,
    parentId: null,
    category: 'Pasivo',
    amount: 0,
    total: null,
    root: true,
  },
  {
    accountName: 'Pasivo Corriente',
    id: 51,
    parentId: 50,
    category: 'Pasivo',
    amount: 0,
    total: null,
    root: false,
  },
  {
    accountName: 'Pasivo Financiero',
    id: 52,
    parentId: 51,
    category: 'Pasivo',
    amount: 100.21,
    total: null,
    root: false,
  },
  {
    accountName: 'Cuentas Por Pagar',
    id: 53,
    parentId: 51,
    category: 'Pasivo',
    amount: 1800,
    total: null,
    root: false,
  },
  {
    id: 60,
    parentId: null,
    accountName: 'Patrimonio',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    root: true,
  },
  {
    id: 61,
    parentId: 60,
    accountName: 'Patrimonio',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    root: false,
  },
  {
    id: 62,
    parentId: 61,
    accountName: 'Capital Social',
    category: 'Patrimonio',
    amount: 20.58,
    total: null,
    root: false,
  },
  {
    id: 63,
    parentId: 61,
    accountName: 'Ganancias Acumuladas',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    root: false,
  },
  {
    id: 64,
    parentId: 63,
    accountName: 'Acumulado de',
    category: 'Patrimonio',
    amount: 1000,
    total: null,
    root: false,
  },
  {
    id: 65,
    parentId: 63,
    accountName: 'mass acumulado',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    root: false,
  },
  {
    id: 66,
    parentId: 65,
    accountName: 'Tes acumulado',
    category: 'Patrimonio',
    amount: 0,
    total: null,
    root: false,
  },
  {
    id: 67,
    parentId: 66,
    accountName: 'anidado mas profundo',
    category: 'Patrimonio',
    amount: 50,
    total: null,
    root: false,
  },
];

@Component({
  selector: 'app-general-balance',
  templateUrl: './general-balance.component.html',
  styleUrl: './general-balance.component.css',
})
export class GeneralBalanceComponent implements OnInit {
  dataSource: GeneralBalance[] = [];
  treeData: GeneralBalance2[] = [];
  values: any = [];
  summaryTotal: number = 0;
  totalActivoSumary: number = 0;
  selectedPeriod: number = 0;

  company: any;

  periodoAnual: any;

  periodList$: Observable<PeriodModel[]> | undefined;

  private readonly periodoService = inject(PeriodService);

  private readonly reportService = inject(ReportServiceService, {
    optional: true,
  });
  constructor() { }

  ngOnInit(): void {


    this.loadInfoBalance();

    this.setInitValues(0);

    this.periodList$ = this.periodoService.getAllPeriods().pipe(
      map(data => {
        data.map(nuevo => {
          const status = nuevo.closureType?.toUpperCase() == "ANUAL" ? nuevo.status = true : nuevo.status;
          const isClosed = nuevo.isClosed == null ? false : true;
          return { ...nuevo, status, isClosed }
        })
        return data
      })
    );


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

  buildTree(data: GeneralBalance[]): void {

    const tree = new Map<number, GeneralBalance2>();
    data.forEach((item) => {
      tree.set(item.id, {
        ...item,
        isCollapsed: true,
        depth: 0,
        children: [],
      });
    });


    data.forEach((item) => {
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

    this.calculateSummary();
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
      if (
        root.category.toUpperCase() === 'PASIVO' ||
        root.category.toUpperCase() === 'PATRIMONIO'
      ) {
        this.summaryTotal += root.total ?? 0;
      }
      //2500.01
    });

    this.totalActivoSumary = this.treeData
      .filter(node => node.category === 'ACTIVO')  // Filtra solo los nodos de la categoría 'ACTIVO'
      .reduce((total, node) => total + (node.total ?? 0), 0);
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

  private setInitValues(id: number) {
    this.reportService
      ?.getGeneralBalanceReport(id)
      .subscribe((response: GeneralBalanceResponse[]) => {


        this.dataSource = [];
        this.treeData = [];
        this.values = [];
        this.summaryTotal = 0;
        this.totalActivoSumary = 0;


        // Convertir el JSON a la estructura de GeneralBalance[]
        const dataBalance: GeneralBalance[] = this.convertToGeneralBalance(response);



        // const indexActive = data.findIndex(
        //   (item) => item.accountName.toUpperCase() === 'ACTIVO'
        // );
        // const indexPasivo = data.findIndex(
        //   (item) => item.accountName.toUpperCase() === 'PASIVO'
        // );

        // const pasivo = data[indexPasivo];
        // data.splice(indexPasivo, 1);
        // data.unshift(pasivo);
        // const active = data[indexActive];
        // data.splice(indexActive, 1);
        // data.unshift(active);

        this.dataSource = dataBalance;
        this.buildTree(dataBalance);
      });
  }

  convertToGeneralBalance(response: GeneralBalanceResponse[]): GeneralBalance[] {
    return [
      ...response.map((item: any) => ({
        id: item.accountId,
        parentId: item.parentId,
        accountName: item.accountName,
        category: item.category,
        amount: item.balance,
        total: null,
        root: true
      })),
    ];
  }

  async onSubmit(e: NgForm) {

    console.log(e.form.value.period);

    if (e.valid) {

      this.setInitValues(e.form.value.period)
    }


  }




  exportToExcel() {

    const table1 = document.querySelector('.table-activos') as HTMLTableElement;
    const table2 = document.querySelector('.table-pasivos') as HTMLTableElement;


    if (table1 && table2) {
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      let ws1: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table1);
      let ws2: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table2);

      ws1 = this.getFilterRows(ws1);
      ws2 = this.getFilterRows(ws2);

      const combinedSheet: XLSX.WorkSheet = {};
      combinedSheet['C1'] = {
        v: "Balance General",
        s: {
          font: { bold: true, font: 48 },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { fgColor: { rgb: "FFFFFF" } },
        }
      };

      combinedSheet['A2'] = { v: "", s: { fill: { fgColor: { rgb: "FFFFFF" } } } };
      combinedSheet['A3'] = { v: "", s: { fill: { fgColor: { rgb: "FFFFFF" } } } };

      this.applyStyles(ws1, 0);


      Object.keys(ws1).forEach(cell => {
        const row = parseInt(cell.replace(/\D/g, ""));
        const col = cell.replace(/\d/g, "");
        const newRow = row + 3;
        const newCell = col + newRow;

        combinedSheet[newCell] = ws1[cell];
      });


      this.applyStyles(ws2, 3);

      Object.keys(ws2).forEach(cell => {
        const row = parseInt(cell.replace(/\D/g, ""));
        const col = cell.replace(/\d/g, "");
        const newCol = String.fromCharCode(col.charCodeAt(0) + 3);
        const newCell = newCol + (row + 3);

        combinedSheet[newCell] = ws2[cell];
      });


      combinedSheet['!cols'] = [
        { wpx: 300 },
        { wpx: 150 },
        {},
        { wpx: 300 },
        { wpx: 150 },
        {},
        {}
      ];


      const lastRowCombined = Math.max(this.getLastRow(ws1), this.getLastRow(ws2) + 1);
      combinedSheet['!ref'] = `A1:G${lastRowCombined + 3}`;


      XLSX.utils.book_append_sheet(wb, combinedSheet, 'Balance General');
      XLSX.writeFile(wb, 'Balance_General.xlsx');
    } else {
      // console.error('No se encontraron las tablas en el DOM');
    }
  }

  applyStyles(sheet: XLSX.WorkSheet, offset: number = 0) {
    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:G1');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[cellRef];
        if (cell) {
          if (row === 0) {
            cell.s = {
              fill: {
                fgColor: { rgb: "FFFF00" }
              },
              font: {
                bold: true,
                color: { rgb: "000000" }
              },
              alignment: {
                horizontal: "center",
                vertical: "center"
              }
            };
          } else {

            cell.s = {
              fill: {
                fgColor: { rgb: "FFFFFF" }
              },
              font: {
                color: { rgb: "000000" }
              },
              alignment: {
                horizontal: "left",
                vertical: "center"
              }
            };
          }
        }
      }
    }
  }

  getLastRow(sheet: XLSX.WorkSheet): number {
    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:G1');
    return range.e.r + 1;
  }


  getFilterRows(obj: XLSX.WorkSheet) {
    const newObjA: any = {};
    Object.keys(obj).forEach(key => {
      if (key.startsWith('A')) {
        newObjA[key] = obj[key];
        delete obj[key];
      }
    });

    const newObjB: any = {};
    Object.keys(obj).forEach(key => {
      if (key.startsWith('B')) {
        newObjB[key] = obj[key];
        delete obj[key];
      }
    });

    const resultObj: any = {};
    Object.keys(newObjA).forEach(key => {
      const matchingKey = key.replace('A', 'B');
      if (newObjB[matchingKey]) {
        resultObj[key] = newObjA[key];
        resultObj[matchingKey] = newObjB[matchingKey];
      }
    });

    return { ...obj, ...resultObj };

  }


  loadInfoBalance(){

    this.company = JSON.parse(localStorage.getItem("company") ?? "");

    const periodo = JSON.parse(localStorage.getItem("periodo") ?? "");


    const startDate = new Date(periodo.startPeriod);
    const endDate = new Date(periodo.endPeriod);

    const formatMonth = (month:any) => {
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return months[month];
    };

    this.periodoAnual = `Del ${startDate.getDate()} de ${formatMonth(startDate.getMonth())} al ${endDate.getDate()} de ${formatMonth(endDate.getMonth())} de ${startDate.getFullYear()}`;


  }
}  