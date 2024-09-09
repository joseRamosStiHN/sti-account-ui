import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  ngOnInit(): void {
    const d = this.generateRandomLocalData();
    this.data$ = new BehaviorSubject(d);
  }

  generateRandomLocalData(): LocalData[] {
    const randomData: LocalData[] = [];
    const types = ['Factura de clientes', 'Factura de proveedor', 'Bancos'];
    const states = ['Publicado', 'Borrador'];
    for (let i = 0; i < 5; i++) {
      randomData.push({
        id: i + 1,
        referenceNumber: Math.random().toString(36).substring(7),
        reference: `Ref-${i + 1}`,
        journalEntry: types[Math.floor(Math.random() * types.length)],
        journalEntryId: Math.floor(Math.random() * 100),
        total: parseFloat((Math.random() * 1000).toFixed(2)),
        status: states[Math.floor(Math.random() * states.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      });
    }
    return randomData;
  }
}
