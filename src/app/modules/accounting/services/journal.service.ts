import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { JournalModel } from 'src/app/modules/accounting/models/JournalModel';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private apiURL = 'https://cc39ba12-0eb3-43e2-ac50-d64f47d081e6.mock.pstmn.io';

  /*------------------------------------------
  --------------------------------------------
  Http Header Options
  --------------------------------------------
  --------------------------------------------*/
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}


  /**
   * Method that brings a list with all the accounting journal
   *
   * @return response()
   */
  getAllAccountingJournal(): Observable<JournalModel[]> {
    const url = `${this.apiURL}/api/v1/transaction/accounting/journal`;
    return this.httpClient.get<JournalModel[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

}
