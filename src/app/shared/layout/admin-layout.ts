import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Location } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * AdminLayout
 * ------------------------------------------------------------
 * Ithu dhan COMMON SHELL — ippo sidebar illa, top navbar (company
 * logo + Home + Full Screen + Profile) + <router-outlet> mattum
 * dhan. Ella authenticated page um (Dashboard, All Products,
 * Add Product, Categories, Orders...) itha children ah than
 * route aagum (paaru app.routes.ts). Navigation ku "Home" button
 * click panna app-home-menu (grid menu page) ku poyidum.
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss']
})
export class AdminLayout {
  profileMenuOpen = false;
  isFullScreen = false;
  defaultAvatar = 'img/admin-img.jfif';

  private pageHistory: string[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {

        const url = event.urlAfterRedirects;

        if (
          this.pageHistory.length === 0 ||
          this.pageHistory[this.pageHistory.length - 1] !== url
        ) {
          this.pageHistory.push(url);
        }

      });
  }

  get currentUser() {
    return this.auth.currentUser();
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  /** clicking anywhere outside the profile menu closes it */
  @HostListener('document:click')
  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  /** browser Full Screen API vachi toggle pannurom */
  toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      this.isFullScreen = true;
    } else {
      document.exitFullscreen?.();
      this.isFullScreen = false;
    }
  }

  @HostListener('document:fullscreenchange')
  onFullScreenChange(): void {
    this.isFullScreen = !!document.fullscreenElement;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }


  goBack(): void {

    // Dashboard-la irundha back poga koodathu
    if (this.router.url === '/dashboard') {
      return;
    }

    this.pageHistory.pop();

    const previous = this.pageHistory[this.pageHistory.length - 1];

    if (previous) {
      this.router.navigateByUrl(previous);
    } else {
      this.router.navigate(['/dashboard']);
    }

  }
}
