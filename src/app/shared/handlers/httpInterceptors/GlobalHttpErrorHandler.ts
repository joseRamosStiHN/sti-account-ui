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
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry({
        count: 3,
        delay: (_, retryCount) => timer(retryCount * 1000), // by each try delay 1s eg.: 1st attempt 1s, 2nd attempt = 2s, 3rd attempt 3s ...
      }),
      catchError((err) => {
        console.error('error catch in interceptor');
        return throwError(() => err);
      })
    );
  }
}
