import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * loadingInterceptor
 * ------------------------------------------------------------
 * Ella outgoing HTTP request kum automatic ah global loader
 * (app-loader.ts) show/hide pandrom. Ithu app.config.ts la
 * provideHttpClient(withInterceptors([...])) la register aagum.
 *
 * Oru specific request ku loader thevai illa na (e.g. silent
 * background polling), andha request la itha header add pannunga:
 *
 *   this.http.get(url, { headers: { 'X-Skip-Loader': 'true' } })
 * ------------------------------------------------------------
 */
const SKIP_LOADER_HEADER = 'X-Skip-Loader';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.headers.has(SKIP_LOADER_HEADER)) {
    const silentReq = req.clone({
      headers: req.headers.delete(SKIP_LOADER_HEADER)
    });
    return next(silentReq);
  }

  loading.show();

  return next(req).pipe(
    finalize(() => loading.hide())
  );
};
