import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { JournalTypes } from 'src/app/modules/accounting/models/JournalModel';
import { JournalService } from 'src/app/modules/accounting/services/journal.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrl: './journal-list.component.css'
})
export class JournalListComponent {



  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;



  journalList$: Observable<any> | undefined;

  private readonly router = inject(Router);
  private readonly journalService = inject(JournalService);


  ngOnInit(): void {
    this.journalList$ = this.journalService.getAllAccountingJournal().pipe(
      map(data =>  {
       return data.map((journal)=>{
        if (journal.accountType == JournalTypes.Bancos) {
          journal.defaultAccountName = journal.bankAccountName;
          return journal;
        }
        if (journal.accountType == JournalTypes.Efectivo) {
          journal.defaultAccountName = journal.cashAccountName;
          return journal;
        }
        return journal;
        })
      })
    );
  }

  onEditJournal(e: any) {

    this.router.navigate(['/accounting/configuration/journal/update-journal', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/configuration/journal/new-journal']);
  };

  async updateJournal(data:any){
    let dialogo = await confirm(`¿Está seguro de que desea activar configuracion?`, 'Advertencia');
    if (!dialogo) {
      data.data.status = false;      
      return;
    }

    const journalRequest = data.data;

    if (journalRequest.accountType == JournalTypes.Bancos) {
      journalRequest.defaultAccountName = null;
   
    } else if (journalRequest.accountType == JournalTypes.Efectivo) {
      journalRequest.defaultAccountName = null;
    }

    this.journalService.updateJournal(journalRequest.id, journalRequest).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros Actualizado correctamente';
        this.showToast = true;
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al actualizar Diario';
        this.showToast = true;
      },
    });
 
   }
}
