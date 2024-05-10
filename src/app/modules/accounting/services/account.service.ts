import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountAPIResponse, AccountCategories } from '../models/APIModels';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
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
   * Method that brings a list with all the accounts
   *
   * @return response()
   */
  getAllAccount(): Observable<AccountAPIResponse[]> {
    return this.httpClient.get<AccountAPIResponse[]>(
      this.apiURL + '/api/v1/accounts'
    );
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  findAccountById(id: number): Observable<AccountAPIResponse> {
    const url = `${this.apiURL}/api/v1/accounts/${id}`;
    return this.httpClient.get<AccountAPIResponse>(url);
  }

  /**
   * Method to create account
   *
   * @return response()
   */
  createAccount(data: any): Observable<any> {
    return this.httpClient
      .post(
        this.apiURL + '/api/v1/accounts',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }

  /**
   * Method to update account
   *
   * @return response()
   */
  updateAccount(id: number, data: any): Observable<any> {
    return this.httpClient
      .put(
        this.apiURL + '/api/v1/accounts/' + id,
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
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

  getCategories(): Observable<AccountCategories[]> {
    const url = `${this.apiURL}/api/v1/accounts/categories`;
    return this.httpClient.get<AccountCategories[]>(url);
  }
}
