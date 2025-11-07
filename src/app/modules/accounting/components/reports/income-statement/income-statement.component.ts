import { Component, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import config from 'devextreme/core/config';
import { finalize, map, Observable, of, switchMap, catchError } from 'rxjs';
import { IncomeStatement } from 'src/app/modules/accounting/models/APIModels';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { ReportServiceService } from 'src/app/modules/accounting/services/report-service.service';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

type Typical = 'D' | 'C';

type Aggregates = {
  totalVentas: number;
  devoluciones: number;
  descuentos: number;
  ventasNetas: number;
  totalCompras: number;
  invIni: number;
  invFin: number;
  costoDeVentas: number;
  utilidadBruta: number;
  gAdmin: number;
  gGenerales: number;
  gDep: number;
  gastosOperativos: number;
  resultadoOperativo: number;
  gFin: number;
  utilidadAntesImpuestos: number;
};

interface TreeRow {
  id: string | number;
  parentId: string | number | null;
  level: 0 | 1 | 2;
  description: string;
  amount: number | null;
  bold?: boolean;
  isTotal?: boolean;
}

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
  styleUrls: ['./income-statement.component.css'],
})
export class IncomeStatementComponent implements OnInit {
  // Datos renderizados (tabla)
  treeRows: TreeRow[] = [];
  expandedRowKeys: (string | number)[] = [];

  // Data cruda
  incomeStatement: IncomeStatement[] = [];

  // Índices del payload para cálculos y pintado
  private indexByName = new Map<string, IncomeStatement>();
  private indexByParent = new Map<string, IncomeStatement[]>();

  // Índices del árbol renderizado (para +/– y visibilidad)
  private parentById = new Map<string | number, string | number | null>();
  private childrenById = new Map<string | number, (string | number)[]>();

  // UI
  isLoading = false;
  errorMsg: string | null = null;

  // Controles
  selectedPeriod = 0;

  // Encabezado
  company: any;
  periodoAnual = '';

  // Periodos
  periodList$?: Observable<PeriodModel[]>;

  // Servicios
  private readonly periodoService = inject(PeriodService);
  private readonly reportService = inject(ReportServiceService);

  // Config ISR
  private taxScope: 'Mensual' | 'Anual' = 'Mensual';
  private fallbackTaxRate = 0.25;

  constructor() {
    config({
      defaultCurrency: 'HNL',
      defaultUseCurrencyAccountingStyle: true,
      serverDecimalSeparator: '.',
      forceIsoDateParsing: true,
    });
  }

  // ================= Ciclo de vida =================
  ngOnInit(): void {
    this.company = JSON.parse(localStorage.getItem('company') ?? '{}');
    const periodo = JSON.parse(localStorage.getItem('periodo') ?? '{}');

    this.periodList$ = this.periodoService.getAllPeriods().pipe(
      map((data) =>
        data.map((p) => ({
          ...p,
          status: p.closureType?.toUpperCase() === 'ANUAL' ? true : p.status,
          isClosed: p.isClosed == null ? false : true,
        })),
      )
    );

    this.loadInfoBalance(periodo);
    this.fetchAndBuild(0);
  }

  // ================= Acciones UI =================
  onSubmit(e: NgForm) {
    if (!e.valid) return;

    const pid = e.form.value.period;
    this.fetchAndBuild(pid);

    this.periodList$?.subscribe((list) => {
      const periodo = list.find((p) => p.id === pid);
      if (periodo) this.loadInfoBalance(periodo);
      this.taxScope = (periodo?.closureType?.toUpperCase() === 'ANUAL') ? 'Anual' : 'Mensual';
    });
  }

  // ================= Carga de datos =================
  private fetchAndBuild(periodId: number) {
    this.isLoading = true;
    this.errorMsg = null;

    this.reportService.getIncomeStatement(periodId)
      .pipe(
        finalize(() => (this.isLoading = false)),
        switchMap((data: IncomeStatement[]) => {
          this.incomeStatement = data ?? [];
          this.buildIndexes();

          const agg = this.computeAggregates();

          // Obtener tasa de ISR real según UAI y alcance (Mensual/Anual)
          return this.periodoService.getUtilityTaxRate(this.taxScope, agg.utilidadAntesImpuestos).pipe(
            catchError(() => of(this.fallbackTaxRate)),
            map((rate) => ({ rate, agg }))
          );
        })
      )
      .subscribe({
        next: ({ rate, agg }) => {
          const built = this.buildRows(agg, rate); // filas y resumenId
          this.treeRows = built.rows;

          // Solo "RESUMEN" expandido al cargar
          const initialExpanded = this.onlyResumenExpanded(built.resumenId);
          this.finalizeTreeIndexes(this.treeRows, initialExpanded);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'No se pudo cargar el Estado de Resultados.';
        },
      });
  }

  // ================= Índices y sumas del payload =================
  private buildIndexes() {
    this.indexByName.clear();
    this.indexByParent.clear();

    for (const it of this.incomeStatement) {
      this.indexByName.set(it.account, it);
      const p = it.accountParent ?? '';
      if (!this.indexByParent.has(p)) this.indexByParent.set(p, []);
      this.indexByParent.get(p)!.push(it);
    }
  }

  private sumDescendants(rootName: string, typical?: Typical): number {
    if (!rootName) return 0;
    const stack: string[] = [rootName];
    const seen = new Set<string>();
    let total = 0;

    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);

      const children = this.indexByParent.get(cur) ?? [];
      for (const ch of children) {
        if (!typical || ch.typicalBalance === typical) {
          total += this.fmt(ch.amount as any);
        }
        stack.push(ch.account);
      }
    }
    return total;
  }

  // Emite subárbol como viene del backend
  private emitSubtree(
    rows: TreeRow[],
    parentName: string | null,
    parentRowId: string | number | null,
    baseLevel: 0 | 1 | 2
  ) {
    const children = this.indexByParent.get(parentName ?? '') ?? [];
    for (const ch of children) {
      const rowId = `${ch.account}-${Math.random().toString(36).slice(2, 8)}`;
      rows.push({
        id: rowId,
        parentId: parentRowId,
        level: baseLevel,
        description: ch.account,
        amount: this.fmt(ch.amount as any),
      });

      // Dejar cerrados por defecto (solo RESUMEN abierto)
      this.emitSubtree(rows, ch.account, rowId, Math.min(baseLevel + 1, 2) as any);
    }
  }

  // ================= Agregados (sin ISR) =================
  private computeAggregates(): Aggregates {
    // Ventas netas
    const totalVentas = this.indexByName.has('VENTAS')
      ? this.sumDescendants('VENTAS', 'C')
      : 0;

    const devoluciones = this.indexByName.has('DEVOLUCIONES SOBRE VENTAS')
      ? this.sumDescendants('DEVOLUCIONES SOBRE VENTAS', 'C')
      : 0;

    const descuentos = this.indexByName.has('DESCUENTOS SOBRE VENTAS')
      ? this.sumDescendants('DESCUENTOS SOBRE VENTAS', 'C')
      : 0;

    const ventasNetas = totalVentas - devoluciones - descuentos;

    // Compras e inventarios => costo de ventas
    const totalCompras = this.indexByName.has('COMPRAS') ? this.sumDescendants('COMPRAS') : 0;
    const invIni = this.indexByName.has('INVENTARIO INICIAL') ? this.sumDescendants('INVENTARIO INICIAL') : 0;
    const invFin = this.indexByName.has('INVENTARIO FINAL') ? this.sumDescendants('INVENTARIO FINAL') : 0;

    const costoDeVentas = (invIni || invFin) ? (invIni + totalCompras - invFin) : totalCompras;

    const utilidadBruta = ventasNetas - costoDeVentas;

    // Gastos operativos
    const gAdmin = this.indexByName.has('GASTOS ADMINISTRATIVOS') ? this.sumDescendants('GASTOS ADMINISTRATIVOS') : 0;
    const gGenerales = this.indexByName.has('GASTOS GENERALES') ? this.sumDescendants('GASTOS GENERALES') : 0;
    const gDep = this.indexByName.has('GASTOS POR DEPRECIACION') ? this.sumDescendants('GASTOS POR DEPRECIACION') : 0;

    const gastosOperativos = gAdmin + gGenerales + gDep;
    const resultadoOperativo = utilidadBruta - gastosOperativos;

    // Financieros
    const gFin = this.indexByName.has('GASTOS FINANCIEROS') ? this.sumDescendants('GASTOS FINANCIEROS') : 0;

    // UAI
    const utilidadAntesImpuestos = resultadoOperativo - gFin;

    return {
      totalVentas,
      devoluciones,
      descuentos,
      ventasNetas,
      totalCompras,
      invIni,
      invFin,
      costoDeVentas,
      utilidadBruta,
      gAdmin,
      gGenerales,
      gDep,
      gastosOperativos,
      resultadoOperativo,
      gFin,
      utilidadAntesImpuestos,
    };
  }

  // ================= Construcción de filas (con ISR) =================
  private buildRows(agg: Aggregates, taxRate: number) {
    let idSeq = 1;
    const nid = (p: string) => `${p}-${idSeq++}`;

    const rows: TreeRow[] = [];
    const expanded: (string | number)[] = []; // vacío: ninguna sección expandida por defecto

    // === VENTAS === (header con total: VENTAS NETAS)
    if (this.indexByName.has('VENTAS')) {
      const ventasId = nid('VENTAS');
      rows.push({ id: ventasId, parentId: null, level: 0, description: 'VENTAS', amount: agg.ventasNetas, bold: true });
      this.emitSubtree(rows, 'VENTAS', ventasId, 1);
      if (agg.devoluciones) rows.push({ id: nid('VEN-DV'), parentId: ventasId, level: 1, description: '(-) Devoluciones sobre Ventas', amount: agg.devoluciones });
      if (agg.descuentos) rows.push({ id: nid('VEN-DS'), parentId: ventasId, level: 1, description: '(-) Descuentos sobre Ventas', amount: agg.descuentos });
      rows.push({ id: nid('VEN-N'), parentId: ventasId, level: 1, description: 'VENTAS NETAS', amount: agg.ventasNetas, bold: true, isTotal: true });
    }

    // === COMPRAS === (header con total compras)
    if (this.indexByName.has('COMPRAS')) {
      const comprasId = nid('COMPRAS');
      rows.push({ id: comprasId, parentId: null, level: 0, description: 'COMPRAS', amount: agg.totalCompras, bold: true });
      this.emitSubtree(rows, 'COMPRAS', comprasId, 1);

      if (this.indexByName.has('INVENTARIO INICIAL')) {
        rows.push({ id: nid('COM-II'), parentId: comprasId, level: 1, description: 'INVENTARIO INICIAL', amount: agg.invIni });
      }
      if (this.indexByName.has('INVENTARIO FINAL')) {
        rows.push({ id: nid('COM-IF'), parentId: comprasId, level: 1, description: 'INVENTARIO FINAL', amount: agg.invFin });
      }

      rows.push({ id: nid('COM-T'), parentId: comprasId, level: 1, description: 'TOTAL COMPRAS', amount: agg.totalCompras, bold: true, isTotal: true });
      rows.push({ id: nid('COM-CV'), parentId: comprasId, level: 1, description: 'COSTO DE VENTAS', amount: agg.costoDeVentas, bold: true, isTotal: true });
    }

    // === GASTOS ADMINISTRATIVOS ===
    if (this.indexByName.has('GASTOS ADMINISTRATIVOS')) {
      const adminId = nid('GAD');
      rows.push({ id: adminId, parentId: null, level: 0, description: 'GASTOS ADMINISTRATIVOS', amount: agg.gAdmin, bold: true });
      this.emitSubtree(rows, 'GASTOS ADMINISTRATIVOS', adminId, 1);
      rows.push({ id: nid('GAD-T'), parentId: adminId, level: 1, description: 'TOTAL GASTOS ADMINISTRATIVOS', amount: agg.gAdmin, bold: true, isTotal: true });
    }

    // === GASTOS GENERALES ===
    if (this.indexByName.has('GASTOS GENERALES')) {
      const genId = nid('GGE');
      rows.push({ id: genId, parentId: null, level: 0, description: 'GASTOS GENERALES', amount: agg.gGenerales, bold: true });
      this.emitSubtree(rows, 'GASTOS GENERALES', genId, 1);
      rows.push({ id: nid('GGE-T'), parentId: genId, level: 1, description: 'TOTAL GASTOS GENERALES', amount: agg.gGenerales, bold: true, isTotal: true });
    }

    // === GASTOS POR DEPRECIACION ===
    if (this.indexByName.has('GASTOS POR DEPRECIACION')) {
      const depId = nid('GDP');
      rows.push({ id: depId, parentId: null, level: 0, description: 'GASTOS POR DEPRECIACION', amount: agg.gDep, bold: true });
      this.emitSubtree(rows, 'GASTOS POR DEPRECIACION', depId, 1);
      rows.push({ id: nid('GDP-T'), parentId: depId, level: 1, description: 'TOTAL GASTOS POR DEPRECIACION', amount: agg.gDep, bold: true, isTotal: true });
    }

    // === GASTOS FINANCIEROS ===
    if (this.indexByName.has('GASTOS FINANCIEROS')) {
      const finId = nid('GFI');
      rows.push({ id: finId, parentId: null, level: 0, description: 'GASTOS FINANCIEROS', amount: agg.gFin, bold: true });
      this.emitSubtree(rows, 'GASTOS FINANCIEROS', finId, 1);
      rows.push({ id: nid('GFI-T'), parentId: finId, level: 1, description: 'TOTAL GASTOS FINANCIEROS', amount: agg.gFin, bold: true, isTotal: true });
    }

    // === RESUMEN (único expandido) ===
    const isr = agg.utilidadAntesImpuestos > 0 ? +(agg.utilidadAntesImpuestos * taxRate).toFixed(2) : 0;
    const utilidadNeta = agg.utilidadAntesImpuestos + isr;

    const resumenId = nid('RES');
    rows.push({ id: resumenId, parentId: null, level: 0, description: 'RESUMEN', amount: null, bold: true });
    expanded.push(resumenId);

    rows.push({ id: nid('RES-UB'), parentId: resumenId, level: 1, description: 'UTILIDAD BRUTA', amount: agg.utilidadBruta, bold: true, isTotal: true });
    rows.push({ id: nid('RES-CO'), parentId: resumenId, level: 1, description: 'COSTO DE VENTAS', amount: agg.costoDeVentas, bold: true, isTotal: true });
    rows.push({ id: nid('RES-GO'), parentId: resumenId, level: 1, description: 'TOTAL GASTOS OPERATIVOS', amount: agg.gastosOperativos, bold: true, isTotal: true });
    rows.push({ id: nid('RES-RO'), parentId: resumenId, level: 1, description: 'RESULTADO OPERATIVO', amount: agg.resultadoOperativo, bold: true, isTotal: true });
    rows.push({ id: nid('RES-GF'), parentId: resumenId, level: 1, description: 'TOTAL GASTOS FINANCIEROS', amount: agg.gFin, bold: true, isTotal: true });
    rows.push({ id: nid('RES-UAI'), parentId: resumenId, level: 1, description: 'UTILIDAD ANTES DE IMPUESTOS', amount: agg.utilidadAntesImpuestos, bold: true, isTotal: true });
    rows.push({ id: nid('RES-ISR'), parentId: resumenId, level: 1, description: `Impuesto Sobre la Renta (${(taxRate * 100).toFixed(0)}%)`, amount: isr });
    rows.push({ id: nid('RES-UN'), parentId: resumenId, level: 1, description: 'UTILIDAD O PÉRDIDA NETA DEL EJERCICIO', amount: utilidadNeta, bold: true, isTotal: true });

    return { rows, expanded, resumenId };
  }

  // ================= Índices del árbol renderizado =================
  private finalizeTreeIndexes(rows: TreeRow[], expanded: (string|number)[]) {
    this.parentById.clear();
    this.childrenById.clear();

    for (const r of rows) {
      this.parentById.set(r.id, r.parentId ?? null);
      if (!this.childrenById.has(r.id)) this.childrenById.set(r.id, []);
    }
    for (const r of rows) {
      if (r.parentId != null) {
        if (!this.childrenById.has(r.parentId)) this.childrenById.set(r.parentId, []);
        this.childrenById.get(r.parentId)!.push(r.id);
      }
    }

    this.expandedRowKeys = expanded;
  }

  private onlyResumenExpanded(resumenId: string | number): (string|number)[] {
    return [resumenId];
  }

  // ================= Lógica de expansión/visibilidad (tabla) =================
  isExpanded(id: string | number): boolean {
    return this.expandedRowKeys.includes(id);
  }

  hasChildren(id: string | number): boolean {
    return (this.childrenById.get(id)?.length ?? 0) > 0;
  }

  toggle(id: string | number) {
    const i = this.expandedRowKeys.indexOf(id);
    if (i >= 0) this.expandedRowKeys.splice(i, 1);
    else this.expandedRowKeys.push(id);
  }

  private isVisibleRow(id: string | number): boolean {
    let cur = this.parentById.get(id) ?? null;
    while (cur !== null && cur !== undefined) {
      if (!this.isExpanded(cur)) return false;
      cur = this.parentById.get(cur) ?? null;
    }
    return true;
  }

  get visibleRows(): TreeRow[] {
    return this.treeRows.filter(r => this.isVisibleRow(r.id));
  }

  // ================= Utils =================
  private fmt(n: number): number { return Number.isFinite(n) ? Number(n) : 0; }

  calcAbs(v: number | null): number | null {
    return v == null ? null : Math.abs(v);
  }

  calculateAmount = (row: any) => row?.amount == null ? null : Math.abs(row.amount);

  // ================= Exportación Excel =================
  exportExcel() {
    if (!this.treeRows?.length) return;

    const wb = new Workbook();
    const ws = wb.addWorksheet('Estado de Resultados');

    ws.mergeCells('A1:B1');
    ws.getCell('A1').value = this.company?.name ?? 'Empresa';
    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.mergeCells('A2:B2');
    ws.getCell('A2').value = 'Estado de Resultados';
    ws.getCell('A2').font = { bold: true, size: 13 };
    ws.getCell('A2').alignment = { horizontal: 'center' };

    ws.mergeCells('A3:B3');
    ws.getCell('A3').value = this.periodoAnual;
    ws.getCell('A3').alignment = { horizontal: 'center' };

    ws.getCell('A5').value = 'Descripción';
    ws.getCell('B5').value = 'Monto';
    ws.getRow(5).font = { bold: true };
    ws.getRow(5).alignment = { horizontal: 'center' };

    const LEMPIRA_FMT = '"L." #,##0.00;[Red]"L." -#,##0.00';

    let r = 6;
    for (const row of this.treeRows) {
      const desc = ws.getCell(`A${r}`);
      desc.value = row.description;
      desc.alignment = { indent: row.level, vertical: 'middle' };
      if (row.bold) desc.font = { bold: true };

      const val = row.amount == null ? null : Math.abs(row.amount);
      const amt = ws.getCell(`B${r}`);
      amt.value = val;
      amt.numFmt = LEMPIRA_FMT;
      amt.alignment = { horizontal: 'right' };
      if (row.bold) amt.font = { bold: true };

      if (row.isTotal) {
        ws.getRow(r).border = { top: { style: 'thin' }, bottom: { style: 'double' } };
      }
      r++;
    }

    ws.getColumn(1).width = 60;
    ws.getColumn(2).width = 18;

    wb.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Estado_de_Resultados.xlsx');
    });
  }

  // ================= Encabezado (periodo) =================
  loadInfoBalance(periodo: any) {
    const startDate = new Date(periodo.startPeriod);
    const endDate = new Date(periodo.endPeriod);
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const fmt = (m: number) => months[m];
    this.periodoAnual = `Del ${startDate.getDate()} de ${fmt(startDate.getMonth())} al ${endDate.getDate()} de ${fmt(endDate.getMonth())} de ${startDate.getFullYear()}`;
  }
}
