import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { CompanieResponse, companyByUser, CompanyRequest, CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private apiURL = environment.SECURITY_API_URL;


  private iscompanyLoging = new BehaviorSubject<CompanieResponse | null>(null);
  private companies = new BehaviorSubject<CompanieResponse[]>([]);

  private loadPages = new BehaviorSubject<Set<number>>(new Set());

 
  loadPages$= this.loadPages.asObservable();
 
  companies$ = this.companies.asObservable();
  companyLogin$ = this.iscompanyLoging.asObservable();

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
    * Method that brings a list companys by User
    *
    * @return response()
    */
  getCompanysByUser(page:number,size:number): Observable<companyByUser> {    
    return this.httpClient.get<companyByUser>(
      this.apiURL + `/api/v1/company/company-user?page=${page}&size=${size}`
    );
  }


  /**
    * Method that brings a list companys by User
    *
    * @return response()
    */
  getCompanyByUser(companieId:number): Observable<CompanieResponse> {
    return this.httpClient.get<CompanieResponse>(
      this.apiURL + `/api/v1/company/user/${companieId}`
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
  updateCompany(data: CompanyRequest, id: number, actionUser: number): Observable<any> {
    return this.httpClient
      .put<any>(
        this.apiURL + `/api/v1/company/${id}/${actionUser}`,
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


  setCompany(company: CompanieResponse) {
    this.iscompanyLoging.next(company);
  }

  getCompany(): any {
    return this.iscompanyLoging.getValue();
  }

  setCompanys(company: CompanieResponse[]) {
    this.companies.next(company);
  }
  
  getCompanies(){
    return this.companies.getValue();
  }

  setLoadPages(company: Set<number>) {
    this.loadPages.next(company);
  }
  
  getLoadPages(){
    return this.loadPages.getValue();
  }

}