import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError, timer } from 'rxjs';

@Injectable()
export class GlobalHttpErrorHandler implements HttpInterceptor {
  
  
  intercept(req: HttpRequest<any>,next: HttpHandler): Observable<HttpEvent<any>> {

    console.log("Interceptores");
    

    console.log(req);
    

    return next.handle(req).pipe(
      retry({
        count: 3,
        delay: (_, retryCount) => timer(retryCount * 1000),
      }),
      catchError((err) => {
        console.error('error catch in interceptor');
        return throwError(() => err);
      })
    );
  }
}
