import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

/**
 * httpErrorInterceptor
 * ------------------------------------------------------------
 * Ella HTTP error um inga pass aagum, appuram error type ku
 * match aana page ku redirect pandrom:
 *
 *   status 0    -> /network-error   (server ye reach aagala —
 *                                     no internet / server down / CORS)
 *   status 401  -> session expired, auto logout + /login
 *   status 403  -> /forbidden       (logged in but no permission)
 *   status 500+ -> /server-error    (GET request mattum — POST/PUT/DELETE
 *                                     ku redirect pannala, illana andha
 *                                     screen la irundha form data lose
 *                                     aayidum. Adhukku component/service
 *                                     level la AlertService.error() vachu
 *                                     handle pannunga.)
 *
 * Kadaisila error ah rethrow pandrom, so oru specific component
 * innum wanted na (e.g. custom toast) adhu vera vela pannalam.
 * ------------------------------------------------------------
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {

      if (error instanceof HttpErrorResponse) {

        if (error.status === 0) {
          router.navigate(['/network-error'], {
            queryParams: { returnUrl: router.url }
          });
          return throwError(() => error);
        }

        if (error.status === 401) {
          auth.logout();
          router.navigate(['/login'], {
            queryParams: { sessionExpired: true }
          });
          return throwError(() => error);
        }

        if (error.status === 403) {
          router.navigate(['/forbidden']);
          return throwError(() => error);
        }

        if (error.status >= 500 && req.method === 'GET') {
          router.navigate(['/server-error']);
          return throwError(() => error);
        }
      }

      return throwError(() => error);
    })
  );
};
