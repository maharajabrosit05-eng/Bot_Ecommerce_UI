import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * NotFound (404)
 * ------------------------------------------------------------
 * app.routes.ts la wildcard route ( path: '**' ) ku ithan
 * component. Match aagatha edha URL ah type panna/click panna
 * naanum ithu than varum — logged-in or logged-out edhuvaana
 * work aagum (AdminLayout kulla illa, standalone page).
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.html'
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);
  private auth = inject(AuthService);

  get homeLabel(): string {
    return this.auth.isLoggedIn() ? 'Dashboard' : 'Login';
  }

  goHome(): void {
    this.router.navigate([this.auth.isLoggedIn() ? '/dashboard' : '/login']);
  }

  goBack(): void {
    // browser history irundha adhula back pogum, illana home ku
    history.length > 1 ? this.location.back() : this.goHome();
  }
}
