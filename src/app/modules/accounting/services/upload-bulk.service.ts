import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { TransactionUpload, UploadBulkSettings } from 'src/app/modules/accounting/models/APIModels';
import { UploadBulkSettingsModel } from 'src/app/modules/accounting/models/models';

@Injectable({
  providedIn: 'root'
})
export class UploadBulkService {

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
  getAllBulkSettings(): Observable<UploadBulkSettings[]> {
    const url = `${this.apiURL}/api/v1/upload-bulk-transaction`;
    return this.httpClient.get<UploadBulkSettings[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }


  getBulkConfigurationById(id: number): Observable<UploadBulkSettingsModel> {
    const url = `${this.apiURL}/api/v1/upload-bulk-transaction/${id}`;
    return this.httpClient.get<UploadBulkSettingsModel>(url);
  }



  /**
   * Method to create a transaction
   *
   * @return response()
   */
  createUBulkSettings(data: UploadBulkSettingsModel): Observable<UploadBulkSettings> {
    return this.httpClient
      .post<UploadBulkSettings>(
        this.apiURL + '/api/v1/upload-bulk-transaction/config',
        JSON.stringify(data),
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }


  /**
   * Method to update a bulkSettings
   *
   * @return response()
   */
  updateUBulkSettings(id:number, data: UploadBulkSettingsModel): Observable<UploadBulkSettings> {
    return this.httpClient
      .put<UploadBulkSettings>(
        this.apiURL + `/api/v1/upload-bulk-transaction/${id}`,
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Method to upload
   *
   * @return response()
   */
    UploadBulkSettings(data: FormData, idConfig:number, tenandId:number): Observable<TransactionUpload> {

    return this.httpClient
      .post<TransactionUpload>(
        this.apiURL + `/api/v1/upload-bulk-transaction?idConfig=${idConfig}&tenanId=${tenandId}`,
        data
      )
      .pipe(catchError(this.errorHandler));
  }

   /**
   * Method to save Transactions
   *
   * @return response()
   */
   saveTransacionsBulk(data:TransactionUpload): Observable<TransactionUpload> {

    return this.httpClient
      .post<TransactionUpload>(
        this.apiURL + `/api/v1/upload-bulk-transaction/transactions`,
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

}
