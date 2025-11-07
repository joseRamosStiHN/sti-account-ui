import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { PeriodClosing, PeriodsRequest, PeriodsResponse, TaxSettings } from 'src/app/modules/accounting/models/APIModels';
import { ClosingPeriodsAll, NextPeridModel } from 'src/app/modules/accounting/models/models';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {

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
   * Method that brings a list with all the accounting journal
   *
   * @return response()
   */
  getAllPeriods(): Observable<PeriodModel[]> {
    const url = `${this.apiURL}/api/v1/accounting-periods`;
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
    const url = `${this.apiURL}/api/v1/accounting-periods/${id}`;
    return this.httpClient.get<PeriodModel>(url);
  }

  getPeridoBydate(inicio: string, final: string): Observable<PeriodModel[]> {
    const url = `${this.apiURL}/api/v1/accounting-periods/date-range?start=${inicio}&end=${final}`;
    return this.httpClient.get<PeriodModel[]>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }
  /**
  * Method to create a period
  *
  * @return response()
  */
  createPeriod(data: any): Observable<PeriodModel> {
    return this.httpClient
      .post<PeriodModel>(
        this.apiURL + '/api/v1/accounting-periods',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  /**
* Method to create a period Anual
*
* @return response()
*/
  createPeriodAnual(data: any, tenantId: string): Observable<PeriodModel> {

    const httpOptionsNewCompany = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'tenantId': `${tenantId}`
      }),
    };

    return this.httpClient
      .post<PeriodModel>(
        this.apiURL + '/api/v1/accounting-periods',
        JSON.stringify(data),
        httpOptionsNewCompany
      )
      .pipe(catchError(this.errorHandler));
  }


  updatePeriod(
    id: number,
    data: any
  ): Observable<PeriodModel> {
    const url = `${this.apiURL}/api/v1/accounting-periods/${id}`;
    return this.httpClient.put<PeriodModel>(
      url,
      JSON.stringify(data),
      this.httpOptions
    );
  }


  /**
  * Method that brings a list with all the accounting journal
  *
  * @return response()
  */
  getStatusPeriod(): Observable<boolean> {
    const url = `${this.apiURL}/api/v1/accounting-periods/active-period`;
    return this.httpClient.get<boolean>(url).pipe(
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  getInfoClosingPeriod(): Observable<PeriodClosing> {
    const url = `${this.apiURL}/api/v1/accounting-closing/detail`;
    return this.httpClient.get<PeriodClosing>(url).pipe(

      map(periodClosing => {
        periodClosing.startPeriod = this.formateDate(periodClosing.startPeriod);
        periodClosing.endPeriod = this.formateDate(periodClosing.endPeriod);
        return periodClosing;
      }),
      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }

  /**
 * Method that brings a list period Closing 
 *
 * @return response()
 */
  getAllClosing(): Observable<ClosingPeriodsAll[]> {
    const url = `${this.apiURL}/api/v1/accounting-closing`;
    return this.httpClient.get<ClosingPeriodsAll[]>(url).pipe(
      catchError(() => {

        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }


  /**
* Method that brings data next period 
*
* @return response()
*/
  getNextPeriod(): Observable<NextPeridModel> {
    const url = `${this.apiURL}/api/v1/accounting-periods/next-period`;
    return this.httpClient.get<NextPeridModel>(url).pipe(
      catchError(() => {

        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }



  private formateDate(dateStr: string): string {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return '';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }


  /**
* Method to closing a period
*
* @return response()
*/
  closingPeriod(nextPeriod: string): Observable<any> {
    return this.httpClient
      .post<any>(
        `${this.apiURL}/api/v1/accounting-closing/close?newClosureType=${nextPeriod}`,
        null,
        {
          responseType: 'text' as 'json'
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  /**
* Method to closing a period
*
* @return response()
*/
  closingYear(nextPeriod: string): Observable<any> {
    return this.httpClient
      .post<any>(
        `${this.apiURL}/api/v1/accounting-closing/annual-close?newClosureType=${nextPeriod}`,
        null,
        {
          responseType: 'text' as 'json'
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  /**
  * Method that brings a list with all the accounting journal
  *
  * @return response()
  */
  getAllTaxSettings(): Observable<TaxSettings[]> {
    const url = `${this.apiURL}/api/v1/tax-settings`;
    return this.httpClient.get<TaxSettings[]>(url).pipe(

      map(data => {

        data.map((tax) => {

          tax.percent = tax.taxRate == "Excentos" ? 0 : Number(tax.taxRate) || 0
        })

        return data;
      }),

      catchError(() => {
        console.error('catch error in service');
        return throwError(() => {
          return new Error('No se puedo obtener la data.');
        });
      })
    );
  }


  getTaxById(id: number): Observable<TaxSettings> {
    const url = `${this.apiURL}/api/v1/tax-settings/${id}`;
    return this.httpClient.get<TaxSettings>(url);
  }


  updateTax(
    id: number,
    data: TaxSettings
  ): Observable<TaxSettings> {
    const url = `${this.apiURL}/api/v1/tax-settings/${id}`;
    return this.httpClient.put<TaxSettings>(
      url,
      JSON.stringify(data),
      this.httpOptions
    );
  }



  /**
  * Method to create a period
  *
  * @return response()
  */
  createTaxSettings(data: TaxSettings): Observable<PeriodModel> {
    return this.httpClient
      .post<PeriodModel>(
        this.apiURL + '/api/v1/tax-settings',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }


getUtilityTaxRate(scope: 'Mensual' | 'Anual', uai: number): Observable<number> {
  const url = `${this.apiURL}/api/v1/tax-settings/rate?scope=${encodeURIComponent(scope)}&uai=${encodeURIComponent(String(uai))}`;
  return this.httpClient.get<{ rate: number | string }>(url).pipe(
    map(res => typeof res.rate === 'number' ? res.rate : Number(res.rate)),
    catchError((e) => {
      console.error('Fallo consultando tasa ISR, usando fallback 0.25', e);
      return of(0.25);
    })
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
