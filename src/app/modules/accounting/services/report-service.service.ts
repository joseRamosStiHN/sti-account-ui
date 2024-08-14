import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { GeneralBalance } from '../models/APIModels';
import { environment } from '@environment/environment';

export class ReportServiceService {
  private readonly BASE_URL = environment.API;

  private readonly http = inject(HttpClient);
  constructor() {}

  getGeneralBalanceReport() {
    const url = `${this.BASE_URL}/api/v1/balance/general`;
    return this.http.get<GeneralBalance[]>(url);
  }
}
