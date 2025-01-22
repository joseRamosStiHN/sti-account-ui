import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { Login } from 'src/app/shared/models/LoginResponseModel';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private securityApi = environment.SECURITY_API_URL;

  private isLoging = new BehaviorSubject<Login>({
    userName: '',
    active: false,
    companies: [],
    createdAt: new Date(),
    email: '',
    firstName: '',
    id: 0,
    lastName: '',
    globalRoles: []
  });
  userAuthenticate$ = this.isLoging.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true

  };

  private httpClient = inject(HttpClient);

  constructor() { }

  login(login: any): Observable<Login> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<Login>(
      this.securityApi + `/api/v1/login`,
      login,
      this.httpOptions
    );
  }

  setLogin(login: Login) {
    this.isLoging.next(login);
  }
}
