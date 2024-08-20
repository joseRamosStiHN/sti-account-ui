import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {

  private apiURL = 'https://ce9b321d-d740-4953-9b3d-bdea0a2a7011.mock.pstmn.io';

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
  getAllPeriods(): Observable<PeriodModel[]> {
    const url = `${this.apiURL}/api/v1/transaction/accounting/period`;
    return this.httpClient.get<PeriodModel[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  getPeriodById(id: number): Observable<PeriodModel> {
    const url = `${this.apiURL}/api/v1/transaction/accounting/period/${id}`;
    return this.httpClient.get<PeriodModel>(url);
  }


   /**
   * Method to create a period
   *
   * @return response()
   */
   createPeriod(data: PeriodModel): Observable<PeriodModel> {
    return this.httpClient
      .post<PeriodModel>(
        this.apiURL + '/api/v1/transaction/accounting/period',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }


  updatePeriod(
    id: number,
    data: PeriodModel
  ): Observable<PeriodModel> {
    const url = `${this.apiURL}/api/v1/transaction/accounting/period${id}`;
    return this.httpClient.put<PeriodModel>(
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
