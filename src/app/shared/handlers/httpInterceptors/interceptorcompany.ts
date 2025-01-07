import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const company = localStorage.getItem('company'); 
  if (company) {
    const cloned = req.clone({
      setHeaders: {
        tenantId: company,
      },
    });
    return next(cloned);
  } else {
    return next(req);
  }
};
