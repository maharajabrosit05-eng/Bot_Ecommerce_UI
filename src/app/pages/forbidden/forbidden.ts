import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Forbidden (403)
 * ------------------------------------------------------------
 * User login aayirundhaalum, andha resource ku access illa na
 * (role-based permission) http-error.interceptor.ts inga redirect
 * pannum. Role/permission guard future la add pannum pothu ithu
 * ready ah irukkum.
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forbidden.html'
})
export class Forbidden {
  private router = inject(Router);
  private auth = inject(AuthService);

  goHome(): void {
    this.router.navigate([this.auth.isLoggedIn() ? '/dashboard' : '/login']);
  }
}
