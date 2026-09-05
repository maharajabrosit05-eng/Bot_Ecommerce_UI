import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * AppLoader
 * ------------------------------------------------------------
 * Full-screen overlay. Sits once at the root (app.html),
 * outside <router-outlet>, so it works on the login page AND every
 * admin page. Visibility is driven entirely by LoadingService —
 * loading.interceptor.ts flips it on/off automatically for every
 * HTTP call, no manual wiring needed per page.
 *
 * FIX: ring spinner ku badhila, brand loading-logo.mp4 video use
 * pannurom (autoplay + loop + muted, browser autoplay policy ku
 * accommodate pannurom).
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-loader.html',
  styleUrls: ['./app-loader.scss']
})
export class AppLoader {
  private loadingService = inject(LoadingService);
  readonly isLoading = this.loadingService.isLoading;
}