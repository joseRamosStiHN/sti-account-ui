import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { GeneralBalance, TrialBalaceResponse } from '../models/APIModels';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

export class ReportServiceService {
  private readonly BASE_URL = environment.API;

  private readonly http = inject(HttpClient);
  constructor() {}

  getGeneralBalanceReport() {
    const url = `${this.BASE_URL}/api/v1/balance/general`;
    return this.http.get<GeneralBalance[]>(url);
  }

  getTrialBalance():Observable<TrialBalaceResponse> {
    const url = `${this.BASE_URL}/api/v1/trial-balance`;
    return this.http.get<TrialBalaceResponse>(url);
  }
}
