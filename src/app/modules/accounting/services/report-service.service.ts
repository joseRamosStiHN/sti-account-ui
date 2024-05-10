import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { GeneralBalance } from '../models/APIModels';

export class ReportServiceService {
  private readonly BASE_URL = 'http://34.226.208.171/api/v1/balance/general';

  private readonly http = inject(HttpClient);
  constructor() {}

  getGeneralBalanceReport() {
    console.log(this.BASE_URL);
    return this.http.get<GeneralBalance[]>(this.BASE_URL);
  }
}
