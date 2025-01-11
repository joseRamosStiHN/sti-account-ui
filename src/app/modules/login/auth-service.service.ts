import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable } from 'rxjs';
import { Login } from 'src/app/shared/models/LoginResponseModel';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private securityApi = environment.SECURITY_API_URL;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials:true

  };

  private httpClient = inject(HttpClient);

  constructor() { }

  login(login: any): Observable<Login> {

   const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<Login>(
     this.securityApi+ `/api/v1/login`,
      login,
      this.httpOptions
    );
  }
}
