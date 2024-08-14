import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { TransactionResponse } from '../models/APIModels';
import { TransactionModel } from '../models/TransactionModel';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
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
  createTransaction(data: any): Observable<TransactionResponse> {
    return this.httpClient
      .post<TransactionResponse>(
        this.apiURL + '/api/v1/transaction',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }

  getAllTransactionByDocumentType(
    documentId: number
  ): Observable<TransactionResponse[]> {
    const url = `${this.apiURL}/api/v1/transaction/by-document/${documentId}`;
    return this.httpClient.get<TransactionResponse[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  getTransactionById(id: number): Observable<TransactionResponse> {
    const url = `${this.apiURL}/api/v1/transaction/${id}`;
    return this.httpClient.get<TransactionResponse>(url);
  }

  updateTransaction(
    id: number,
    data: TransactionModel
  ): Observable<TransactionResponse> {
    const url = `${this.apiURL}/api/v1/transaction/${id}`;
    return this.httpClient.put<TransactionResponse>(
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
