import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AdjustmentResponseById, SeniorAccounts, TransactionResponse } from '../models/APIModels';
import { TransactionModel } from '../models/TransactionModel';
import { environment } from '@environment/environment';
import { LeaderAccounts } from 'src/app/modules/accounting/models/LeederAccountsDetail';

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

  constructor(private httpClient: HttpClient) { }

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
    const url = this.apiURL + `/api/v1/transaction/by-document/${documentId}`;
    return this.httpClient.get<TransactionResponse[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  getTransactionByDate(dateInit: Date, dateEnd: Date): Observable<TransactionResponse[]> {
    let dateInitFormat: string = this.formateDate(dateInit);
    let dateEndFormat: string = this.formateDate(dateEnd);

    const url = `${this.apiURL}/api/v1/transaction/date-range?start=${dateInitFormat}&end=${dateEndFormat}`;
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

    const transaccion = [id]

    const url = `${this.apiURL}/api/v1/transaction/confirm-transactions`;
    return this.httpClient.put(url, transaccion, this.httpOptions);
  }

  putAllTransaction(transacctions: number[]): Observable<any> {
    const url = `${this.apiURL}/api/v1/transaction/confirm-transactions`;
    return this.httpClient.put(url, transacctions, this.httpOptions);
  }

  putAllDebitNotes(debitNotes: number[]): Observable<any> {
    const url = `${this.apiURL}/api/v1/debit-notes/confirm-debit-notes`;
    return this.httpClient.put(url, debitNotes, this.httpOptions);
  }

  putAllCreditNotes(creditNotes: number[]): Observable<any> {
    const url = `${this.apiURL}/api/v1/credit-notes/confirm-credit-notes`;
    return this.httpClient.put(url, creditNotes, this.httpOptions);
  }


  /**
 * Method that brings a list with all seniorsAccounts
 *
 * @return response()
 */
  getAllLedgerAcounts(): Observable<SeniorAccounts[]> {
    return this.httpClient.get<any[]>(
      this.apiURL + '/api/v1/senior-accountants'
    );
  }


  /**
* Method that brings a list with all seniorsAccounts
*
* @return response()
*/
  getAllSeniorAccounts(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      this.apiURL + '/api/v1/senior-accountants'
    );
  }

  /**
   * Method that brings a list with all journal entries
   *
   * @return response()
   */
  getAllJournalEntries(): Observable<any> {
    return this.httpClient
      .get(this.apiURL + '/api/v1/accounting-entries-notes')

      .pipe(catchError(this.errorHandler));
  }


  /**
   * Method to create a transaction
   *
   * @return response()
   */
  createTransactionCreditNotes(data: any): Observable<TransactionResponse> {
    return this.httpClient
      .post<TransactionResponse>(
        this.apiURL + '/api/v1/credit-notes',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }



  /**
   * Method to create a transaction
   *
   * @return response()
   */
  createTransactionDebitNotes(data: any): Observable<TransactionResponse> {
    return this.httpClient
      .post<TransactionResponse>(
        this.apiURL + '/api/v1/debit-notes',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }


  getAllCreditNoteByTrasactionId(id: number): Observable<any[]> {
    const url = `${this.apiURL}/api/v1/credit-notes/by-transaction/${id}`;
    return this.httpClient.get<any[]>(url);
  }


  getAllDebitNoteByTrasactionId(id: number): Observable<any[]> {
    const url = `${this.apiURL}/api/v1/debit-notes/by-transaction/${id}`;
    return this.httpClient.get<any[]>(url);
  }

  /**
  * Method that brings a list adjusjentment
  *
  * @return response()
  */
  getAllNotasCredits(): Observable<any> {
    return this.httpClient
      .get(this.apiURL + '/api/v1/credit-notes')

      .pipe(catchError(this.errorHandler));
  }


  /**
* Method that brings a list adjusjentment
*
* @return response()
*/
  getAllNotasDebits(): Observable<any> {
    return this.httpClient
      .get(this.apiURL + '/api/v1/debit-notes')

      .pipe(catchError(this.errorHandler));
  }


  getNoteCreditById(id: number): Observable<any> {
    const url = `${this.apiURL}/api/v1/credit-notes/${id}`;
    return this.httpClient.get<any>(url);
  }

  getNoteDebitById(id: number): Observable<any> {
    const url = `${this.apiURL}/api/v1/debit-notes/${id}`;
    return this.httpClient.get<any>(url);
  }



  putStatusCreditNotes(id: number): Observable<any> {

    const transaccion = [id];

    const url = `${this.apiURL}/api/v1/credit-notes/confirm-credit-notes`;

    return this.httpClient.put(url, transaccion, this.httpOptions);
  }

  putStatusDebitNotes(id: number): Observable<any> {

    const transaccion = [id]

    const url = `${this.apiURL}/api/v1/debit-notes/confirm-debit-notes`;
    return this.httpClient.put(url, transaccion, this.httpOptions);
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


  formateDate(date: any): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  getAllTransactionByDocumentTypeDeleteCompany(
    documentId: number,
    tenantId?: string
  ): Observable<TransactionResponse[]> {
    let headers = this.httpOptions.headers;

    if (tenantId) {
      headers = headers.set('tenantId', tenantId);
    }

    const options = {
      ...this.httpOptions,
      headers: headers
    };

    const url = this.apiURL + `/api/v1/transaction/by-document/${documentId}`;
    return this.httpClient.get<TransactionResponse[]>(url, options).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  checkCompanyTransactions(tenantId?: string): Observable<any> {

    let headers = this.httpOptions.headers;

    if (tenantId) {
      headers = headers.set('tenantId', tenantId);
    }

    const options = {
      ...this.httpOptions,
      headers: headers
    };

    return this.httpClient
      .get(this.apiURL + '/api/v1/transaction', options)

      .pipe(catchError(this.errorHandler));
  }
}
