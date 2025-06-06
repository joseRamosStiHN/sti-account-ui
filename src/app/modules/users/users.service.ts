import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { PasswordRecoveryRequest } from 'src/app/modules/login/models/ApiModelsLogin';
import { RolesResponse, UsersRequest, UsersResponse } from 'src/app/modules/users/models/ApiModelUsers';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiURL = environment.SECURITY_API_URL;

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
      this.apiURL + '/api/v1/user/'
    );
  }


  /**
  * Method that brings user by id
  *
  * @return response()
  */
  getUSerById(id: number): Observable<UsersResponse> {
    return this.httpClient.get<UsersResponse>(
      this.apiURL + `/api/v1/user/${id}`
    );
  }


  /**
   * Method that brings a list with all the users by companys
   *
   * @return response()
   */
  getAllUsersByCompany(id: number): Observable<UsersResponse[]> {
    return this.httpClient.get<UsersResponse[]>(
      this.apiURL + `/api/v1/user/by-company/${id}`
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
        this.apiURL + '/api/v1/user/',
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
  updateUser(data: UsersRequest, id: number, userUpdate: number): Observable<any> {
    return this.httpClient
      .put<any>(
        this.apiURL + `/api/v1/user/${id}/${userUpdate}`,
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
      this.apiURL + '/api/v1/lookup/roles'
    );
  }

  /**
* Envia una solicitud para recuperar la contraseña
* @param request Datos para la recuperación de contraseña
* @returns Observable con la respuesta del servidor
*/
  recoverPassword(request: PasswordRecoveryRequest): Observable<any> {
    return this.httpClient.post(
      this.apiURL + '/api/v1/user/recover-password',
      request,
      this.httpOptions
    ).pipe(
      catchError(error => {
        console.error('Error en recuperación de contraseña:', error);
        throw error;
      })
    );
  }

  /**
 * Method to change user password
 * 
 * @return response()
 */
  changePassword(data: any): Observable<any> {
    return this.httpClient.post<any>(
      this.apiURL + '/api/v1/user/change-password',
      JSON.stringify(data),
      this.httpOptions
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
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
