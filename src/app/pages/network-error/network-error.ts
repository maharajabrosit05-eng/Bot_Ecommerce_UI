import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

/**
 * NetworkError
 * ------------------------------------------------------------
 * http-error.interceptor.ts oda status === 0 case la (server ye
 * reach aagala — no internet / server down / CORS block) inga
 * automatic ah redirect aagum, with ?returnUrl=<page they were on>.
 *
 * "Retry" button oru FULL page reload pandrum (window.location),
 * so browser oda actual connectivity ah fresh ah check pannum —
 * router navigation mattum panna, cached state la irundha issue
 * theriyama pogum.
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-network-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-error.html'
})
export class NetworkError {
  private route = inject(ActivatedRoute);

  retry(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    window.location.href = returnUrl || '/dashboard';
  }
}
