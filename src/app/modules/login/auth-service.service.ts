import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { GlobalRole, Login } from 'src/app/shared/models/LoginResponseModel';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })

  };

  private securityApi = environment.SECURITY_API_URL;

  private isLoging = new BehaviorSubject<Login | null>(null);
  userAuthenticate$ = this.isLoging.asObservable();



  private httpClient = inject(HttpClient);

  constructor() { }

  login(login: any): Observable<Login> {

    return this.httpClient.post<Login>(
      this.securityApi + `/api/v1/login`,
      login,
      this.httpOptions
    );
  }

  logout(): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text' as const 
    };
  
    return this.httpClient.post(
      this.securityApi + `/api/v1/login/logout`,
      null,
      httpOptions
    );
  }

  setLogin(login: Login) {
    this.isLoging.next(login);
  }

  getUser(){
    return this.isLoging.getValue();
  }

  getUserId():number{
    return this.isLoging.getValue()?.id || 0;
  }

  getRolesUser():GlobalRole[]{
    return this.isLoging.getValue()?.globalRoles || [];
  }

  getCompaniesList():any{
    return this.isLoging.getValue()?.companies || [];
  }
}
