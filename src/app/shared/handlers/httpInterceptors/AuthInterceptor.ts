import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const tenantId = req.headers.get('tenantId');

    const cloned = req.clone({
      withCredentials: true,
      setHeaders: {
        tenantId: tenantId ?? this.getTenantId(),
      },
    });
    return next.handle(cloned);
  }

  getTenantId(): string {
    const company: string = localStorage.getItem('company') ?? '';
    try {
      const companyObject = JSON.parse(company);
      return companyObject.tenantId;
    } catch (e) {
      return '';
    }
  }
}
