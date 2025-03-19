import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimations } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { GlobalErrorHandler } from './shared/handlers/errors/GlobalErrorHandler';
import { BrowserModule } from '@angular/platform-browser';
import { showControlDirective } from 'src/app/shared/directives/showControlDirective';
import { AuthInterceptor } from 'src/app/shared/handlers/httpInterceptors/AuthInterceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    // provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    importProvidersFrom(BrowserModule),
    importProvidersFrom(showControlDirective),
  ],
};
