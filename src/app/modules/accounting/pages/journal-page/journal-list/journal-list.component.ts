import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrl: './journal-list.component.css'
})
export class JournalListComponent {
  journalList$: Observable<any> | undefined;

  private readonly router = inject(Router);
  private readonly accountService = inject(JournalService);


  ngOnInit(): void {
    this.journalList$ = this.accountService.getAllAccountingJournal();
  }

  onEditJournal(e: any) {
    this.router.navigate(['/accounting/configuration/update-journal', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/journal/new-journal']);
  };
}
