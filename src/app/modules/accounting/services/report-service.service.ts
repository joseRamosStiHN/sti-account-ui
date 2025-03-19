import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { GeneralBalance, GeneralBalanceResponse, IncomeStatement, TrialBalaceResponse } from '../models/APIModels';
import { environment } from '@environment/environment';
import { map, Observable } from 'rxjs';

export class ReportServiceService {
  private readonly BASE_URL = environment.API;

  private readonly http = inject(HttpClient);
  constructor() { }

  getGeneralBalanceReport(id:number): Observable<GeneralBalanceResponse[]> {
    if (id != 0) {
      const url = `${this.BASE_URL}/api/v1/balance/general?periodId=${id}`;
      return this.http.get<GeneralBalanceResponse[]>(url);
    }

    const url = `${this.BASE_URL}/api/v1/balance/general`;
    return this.http.get<GeneralBalanceResponse[]>(url);
    
   
  }

  getTrialBalance(): Observable<TrialBalaceResponse> {
    const url = `${this.BASE_URL}/api/v1/trial-balance`;
    return this.http.get<TrialBalaceResponse>(url);
  }

  getIncomeStatement(id:number): Observable<IncomeStatement[]> {
    if (id == 0) {
       const url = `${this.BASE_URL}/api/v1/income-statement`;
       return this.http.get<IncomeStatement[]>(url).pipe(
        // Convertir el campo 'date' en un objeto Date
        map(data => data.map(statement => ({
          ...statement,
          date: new Date(statement.date)
        })))
      );
    }

    const url = `${this.BASE_URL}/api/v1/income-statement?periodId=${id}`;
    return this.http.get<IncomeStatement[]>(url).pipe(
     // Convertir el campo 'date' en un objeto Date
     map(data => data.map(statement => ({
       ...statement,
       date: new Date(statement.date)
     })))
   );
   

   
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Asegura dos dígitos
    const day = ('0' + date.getDate()).slice(-2); // Asegura dos dígitos

    return `${year}-${month}-${day}`; // Formato yyyy-MM-dd
  }
}
