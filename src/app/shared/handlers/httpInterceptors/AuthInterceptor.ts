import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const company:string | null = localStorage.getItem('company');
    if (company) {
      req = req.clone({
        withCredentials: true,
      });
      const companyObject = JSON.parse(company);

      const cloned = req.clone({
        setHeaders: {
          tenantId: companyObject.company.tenantId
        },
      });
      return next.handle(cloned);

    } else {
      return next.handle(req);
    }
  }

}