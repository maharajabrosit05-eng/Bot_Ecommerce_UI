import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FlatpickrModule } from 'angularx-flatpickr';

import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    // 👈 order matters: loadingInterceptor (global loader) →
    //    authInterceptor (attaches token/OID/EID) →
    //    httpErrorInterceptor (redirects on 401/403/500) — must see the
    //    auth headers already attached before deciding it's an auth error.
    provideHttpClient(
      withInterceptors([loadingInterceptor, authInterceptor, httpErrorInterceptor])
    ),

    importProvidersFrom(FlatpickrModule.forRoot())
  ]
};