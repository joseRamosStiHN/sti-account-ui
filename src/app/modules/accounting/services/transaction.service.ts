import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { BillingClientResponse } from '../models/APIModels';
import { TransactionModel } from '../models/TransactionModel';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiURL = 'http://34.226.208.171';

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
   * Method that brings a list with all the transactions
   *
   * @return response()
   */
  getAll(): Observable<any> {
    return this.httpClient
      .get(this.apiURL + '/api/v1/transaction')

      .pipe(catchError(this.errorHandler));
  }

  /**
   * Method to create a transaction
   *
   * @return response()
   */
  createTransaction(data: any): Observable<BillingClientResponse> {
    return this.httpClient
      .post<BillingClientResponse>(
        this.apiURL + '/api/v1/transaction',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }

  getAllClientBilling(): Observable<BillingClientResponse[]> {
    const url = `${this.apiURL}/api/v1/transaction`;
    return this.httpClient.get<BillingClientResponse[]>(url);
  }

  getTransactionById(id: number): Observable<BillingClientResponse> {
    const url = `${this.apiURL}/api/v1/transaction/${id}`;
    return this.httpClient.get<BillingClientResponse>(url);
  }

  updateTransaction(
    id: number,
    data: TransactionModel
  ): Observable<BillingClientResponse> {
    const url = `${this.apiURL}/api/v1/transaction/${id}`;
    return this.httpClient.put<BillingClientResponse>(
      url,
      JSON.stringify(data),
      this.httpOptions
    );
  }

  postTransaction(id: number): Observable<any> {
    const url = `${this.apiURL}/api/v1/transaction/${id}/post`;
    return this.httpClient.put(url, null, this.httpOptions);
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
