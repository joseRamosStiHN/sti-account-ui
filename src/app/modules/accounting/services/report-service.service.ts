import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { GeneralBalance } from '../components/models/APIModels';

export class ReportServiceService {
  private readonly BASE_URL =
    'http://localhost:8080/api/v1/transaction/balance/general';

  private readonly http = inject(HttpClient);
  constructor() {}

  getGeneralBalanceReport() {
    console.log(this.BASE_URL);
    return this.http.get<GeneralBalance[]>(this.BASE_URL);
  }
}
