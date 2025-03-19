import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { BalancesModel } from 'src/app/modules/accounting/models/AccountModel';
import { BalanceResponse } from 'src/app/modules/accounting/models/BalancesModel';

@Injectable({
  providedIn: 'root'
})
export class BalancesAccountsService {

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


  getBalanceById(id: number): Observable<BalanceResponse[]> {
    const url = `${this.apiURL}/api/v1/balances/${id}`;
    return this.httpClient.get<BalanceResponse[]>(url);
  }

  saveBalance(data: BalancesModel): Observable<BalancesModel> {
    return this.httpClient
      .post<BalancesModel>(
        this.apiURL + '/api/v1/balances',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }

  updateBalance(
    id: number,
    data: BalancesModel
  ): Observable<BalancesModel> {
    const url = `${this.apiURL}/api/v1/balances/${id}`;
    return this.httpClient.put<BalancesModel>(
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
