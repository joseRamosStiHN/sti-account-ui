import { Injectable, ErrorHandler } from '@angular/core';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  override handleError(error: unknown) {
    console.error('Global error handler: ', error);
  }
}
