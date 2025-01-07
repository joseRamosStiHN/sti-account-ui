import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { RolesResponse, UsersRequest, UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiURL = environment.API;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }



  /**
   * Method that brings a list with all the users
   *
   * @return response()
   */
  getAllUsers(): Observable<UsersResponse[]> {
    return this.httpClient.get<UsersResponse[]>(
      '/security/user/'
    );
  }

  /**
   * Method to create a user
   *
   * @return response()
   */
  createUser(data: UsersRequest): Observable<any> {
    return this.httpClient
      .post<any>(
        '/security/user/',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }


   /**
     * Method that brings a list with all the roles
     *
     * @return response()
     */
    getAllRoles(): Observable<RolesResponse[]> {
      return this.httpClient.get<RolesResponse[]>(
        '/security/lookup/roles'
      );
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
