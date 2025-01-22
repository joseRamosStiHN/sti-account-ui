import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { CompanyRequest, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private apiURL = environment.SECURITY_API_URL;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }



  /**
   * Method that brings a list with all the companies
   *
   * @return response()
   */
  getAllCompanies(): Observable<CompanyResponse[]> {
    return this.httpClient.get<CompanyResponse[]>(
      this.apiURL + '/api/v1/company/'
    );
  }


  /**
    * Method that brings company by id
    *
    * @return response()
    */
  getCompanyById(id: number): Observable<any> {
    return this.httpClient.get<CompanyResponse>(
      this.apiURL + `/api/v1/company/${id}`
    );
  }



  /**
  * Method to create a company
  *
  * @return response()
  */
  createCompany(data: CompanyRequest): Observable<any> {
    return this.httpClient
      .post<any>(
        this.apiURL + '/api/v1/company',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }


  /**
   * Method to update a user
   *
   * @return response()
   */
  updateCompany(data: CompanyRequest, id:number): Observable<any> {
    return this.httpClient
      .put<any>(
        this.apiURL + `/api/v1/company/${id}`,
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
