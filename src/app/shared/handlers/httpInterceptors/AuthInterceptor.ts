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
      const cloned = req.clone({
        setHeaders: {
          tenantId: "03357b46-02c1-4ce7-afd0-19f8d0276150",
        },
      });
      return next.handle(cloned);

    } else {
      return next.handle(req);
    }
  }

}