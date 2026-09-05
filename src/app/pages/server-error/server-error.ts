import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * ServerError (500)
 * ------------------------------------------------------------
 * http-error.interceptor.ts oda status >= 500 (GET requests
 * mattum) inga redirect pannum — API/server side la exception
 * or crash nadandhutta.
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-error.html'
})
export class ServerError {
  private router = inject(Router);

  reload(): void {
    window.location.reload();
  }

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
