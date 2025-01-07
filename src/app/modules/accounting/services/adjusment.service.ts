import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { AdjustmentRequest, AdjustmentResponse, AdjustmentResponseById } from 'src/app/modules/accounting/models/APIModels';

@Injectable({
  providedIn: 'root'
})
export class AdjusmentService {
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
   * Method that brings a list adjusjentment
   *
   * @return response()
   */
 getAll(): Observable<any> {
  return this.httpClient
    .get(this.apiURL + '/api/v1/adjustment')

    .pipe(catchError(this.errorHandler));
}


  

    /**
   * Method to create a adjusment
   *
   * @return response()
   */
    createAdjusment(data: AdjustmentRequest): Observable<AdjustmentResponse> {
      return this.httpClient
        .post<AdjustmentResponse>(
          this.apiURL + '/api/v1/adjustment',
          JSON.stringify(data),
          this.httpOptions
        )
  
        .pipe(catchError(this.errorHandler));
    }
  
    getAdjustmentById(id: number): Observable<AdjustmentResponseById> {
      const url = `${this.apiURL}/api/v1/adjustment/${id}`;
      return this.httpClient.get<AdjustmentResponseById>(url);
    }

    putStatusAdjusment(id: number): Observable<any> {
      const url = `${this.apiURL}/api/v1/adjustment/${id}/post`;
      return this.httpClient.put(url, null, this.httpOptions);
    }

    getAllAdjustmentByTrasactionId(id: number): Observable<AdjustmentResponseById[]> {
      const url = `${this.apiURL}/api/v1/adjustment/by-transaction/${id}`;
      return this.httpClient.get<AdjustmentResponseById[]>(url);
    }

    putAllAdjustment(transacctions: number []): Observable<any> {
      const url = `${this.apiURL}/api/v1/adjustment/confirm-adjustments`;
      return this.httpClient.put(url,transacctions, this.httpOptions);
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
