import { HttpInterceptorFn } from '@angular/common/http';

export const globalHttpErrorHandlerInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  return next(req);
};
