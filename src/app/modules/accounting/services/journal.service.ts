import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { AccountTypeResponse } from 'src/app/modules/accounting/models/APIModels';
import { JournalModel } from 'src/app/modules/accounting/models/JournalModel';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private apiURL = environment.API;

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
    const url = `${this.apiURL}/api/v1/accounting-journal`;
    return this.httpClient.get<JournalModel[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  getAllAccountType(): Observable<AccountTypeResponse[]> {
    return this.httpClient.get<AccountTypeResponse[]>(
      this.apiURL + '/api/v1/accounts/account-type'
    );
  }

  /**
   * Method to create a transaction
   *
   * @return response()
   */
  createJoural(data: JournalModel): Observable<JournalModel> {
    return this.httpClient
      .post<JournalModel>(
        this.apiURL + '/api/v1/accounting-journal',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }


  getJournalById(id: number): Observable<JournalModel> {
    const url = `${this.apiURL}/api/v1/accounting-journal/${id}`;
    return this.httpClient.get<JournalModel>(url);
  }


  updateJournal(
    id: number,
    data: JournalModel
  ): Observable<JournalModel> {
    const url = `${this.apiURL}/api/v1/accounting-journal/${id}`;
    return this.httpClient.put<JournalModel>(
      url,
      JSON.stringify(data),
      this.httpOptions
    );
  }


   /**
   * Error Handler Method
   *
   * @return response()
   */
   errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }


}
