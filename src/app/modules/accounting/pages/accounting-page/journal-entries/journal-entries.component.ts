import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { BillingListClient } from 'src/app/modules/accounting/models/models';
import { TransactionService } from 'src/app/modules/accounting/services/transaction.service';

//TODO: esto cambien lo esto es solo para maquetar
interface LocalData {
  id: number;
  referenceNumber?: string; // este es el numero de factura de cliente o proveedor o banco etc,
  reference?: string;
  journalEntry?: string;
  journalEntryId?: number;
  total?: number;
  status?: string;
  date?: Date;
}

@Component({
  selector: 'app-journal-entries',
  templateUrl: './journal-entries.component.html',
  styleUrl: './journal-entries.component.css',
})
export class JournalEntriesComponent implements OnInit {
  data$: Observable<LocalData[] | null> = new BehaviorSubject(null);
  dataSource$: Observable<BillingListClient[]> | undefined;
  private readonly transService = inject(TransactionService);


  dataTable: LocalData[] = [];

  ngOnInit(): void {
    const d = this.generateRandomLocalData();
    this.data$ = new BehaviorSubject(d);

    this.transService.getAllJournalEntries().subscribe({
      next: (data) => {
        this.dataTable = this.fillDataSource(data);
      },
    });

  }


  fillDataSource(data: any): LocalData[] {
    const result: LocalData[] = [];

    // ⬇️ función auxiliar para sumar débitos
    const sumDebits = (arr: any[], kind: 'entryType' | 'short') =>
      arr.reduce((acc, d) => {
        const isDebit = kind === 'entryType'
          ? d.entryType === 'Debito'
          : d.shortEntryType === 'D';
        return acc + (isDebit ? Number(d.amount) : 0);
      }, 0);

    const mapTransactionToLocalData = (
      item: any,
      isAdjustment: boolean = false,
      isCreditNotes: boolean = false,
      isDebitNotes: boolean = false
    ): LocalData => {

      // ⬇️ NUEVO cálculo: suma solo el lado Débito del asiento
      const totalDetail = isAdjustment
        ? sumDebits(item.adjustmentDetails, 'short')
        : (isCreditNotes || isDebitNotes)
          ? sumDebits(item.detailNote, 'short')
          : sumDebits(item.transactionDetails, 'entryType');

      return {
        id: item.id,
        date: isAdjustment ? item.creationDate : item.date,
        referenceNumber: (isAdjustment || isDebitNotes || isCreditNotes) ? item.invoiceNo : item.reference,
        reference: (item.documentType === JournalTypes.Ventas || item.documentType === JournalTypes.Compras)
          ? 'Transacción Contable'
          : (isAdjustment || isDebitNotes || isCreditNotes ? item.reference : item.description),
        journalEntry: item.diaryName,
        total: totalDetail,
        status: item.status?.toUpperCase() === 'DRAFT' ? 'Borrador' : 'Confirmado',
      };
    };

    // construir la tabla
    data.transactions.forEach((item: any) => result.push(mapTransactionToLocalData(item)));
    data.adjustments.forEach((item: any) => result.push(mapTransactionToLocalData(item, true)));
    data.debitNotes.forEach((item: any) => result.push(mapTransactionToLocalData(item, false, false, true)));
    data.creditNotes.forEach((item: any) => result.push(mapTransactionToLocalData(item, false, true)));

    return result;
  }



  generateRandomLocalData(): LocalData[] {
    let randomData: LocalData[] = [];
    const types = ['Factura de clientes', 'Factura de proveedor', 'Bancos'];
    const states = ['Publicado', 'Borrador'];
    // for (let i = 0; i < 5; i++) {
    //   randomData.push({
    //     id: i + 1,
    //     referenceNumber: Math.random().toString(36).substring(7),
    //     reference: `Ref-${i + 1}`,
    //     journalEntry: types[Math.floor(Math.random() * types.length)],
    //     journalEntryId: Math.floor(Math.random() * 100),
    //     total: parseFloat((Math.random() * 1000).toFixed(2)),
    //     status: states[Math.floor(Math.random() * states.length)],
    //     date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    //   });
    // }
    this.transService.getAll().subscribe({
      next: (data) => {
        randomData = data.map((item: any) => ({
          id: item.id,
          referenceNumber: item.entryNumber,
          reference: item.description,
          journalEntry: item.documentType,
          total: 100,
          status: "Borrado"
        } as LocalData));
      },
    });
    return randomData;
  }
}
