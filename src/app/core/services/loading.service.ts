import { Injectable, computed, signal } from '@angular/core';

/**
 * LoadingService
 * ------------------------------------------------------------
 * Global loader state. Keeps a pending-request counter instead
 * of a plain boolean, so if 3 HTTP calls fire at once the loader
 * only hides after ALL 3 finish (not after the first one).
 *
 * Wired automatically for every HTTP call via loading.interceptor.ts.
 * You can also call it manually from any component:
 *
 *   constructor(private loading: LoadingService) {}
 *   this.loading.show();
 *   ...
 *   this.loading.hide();
 * ------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

  private pending = signal(0);

  readonly isLoading = computed(() => this.pending() > 0);

  show(): void {
    this.pending.update(count => count + 1);
  }

  hide(): void {
    this.pending.update(count => Math.max(0, count - 1));
  }

  /** panic button — force the loader off (e.g. after a hard navigation error) */
  reset(): void {
    this.pending.set(0);
  }
}
