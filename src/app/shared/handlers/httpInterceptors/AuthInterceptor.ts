import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    /*  const company: string | null = localStorage.getItem('company');
    console.log('HttpInterceptor company:', company);
    if (company) {
      const companyObject = JSON.parse(company);
      const cloned = req.clone({
        withCredentials: true,
        setHeaders: {
          tenantId: companyObject.company.tenantId,
        },
      });
      console.log('Clone request:', cloned);
      return next.handle(cloned);
    } else {
      return next.handle(req);
    } */
    const cloned = req.clone({
      withCredentials: true,
      setHeaders: {
        tenantId: this.getTenantId(),
      },
    });
    return next.handle(cloned);
  }

  getTenantId(): string {
    const company: string = localStorage.getItem('company') ?? '';
    try {
      const companyObject = JSON.parse(company);
      return companyObject.company.tenantId;
    } catch (e) {
      return '';
    }
  }
}
