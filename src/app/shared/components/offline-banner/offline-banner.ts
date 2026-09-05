import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * OfflineBanner
 * ------------------------------------------------------------
 * Browser oda navigator.onLine / 'online' / 'offline' events ah
 * kettu, device internet illama irundha oru slim red bar top la
 * show pandrom. Ithu network-error page (which needs an actual
 * failed HTTP call to trigger) vida vera — ithu device level
 * connectivity ah kaatum, edhachum API call panna kaathirukama.
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-banner.html',
  styleUrls: ['./offline-banner.scss']
})
export class OfflineBanner implements OnInit, OnDestroy {

  isOffline = signal(!navigator.onLine);

  private handleOffline = () => this.isOffline.set(true);
  private handleOnline = () => this.isOffline.set(false);

  ngOnInit(): void {
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('online', this.handleOnline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('online', this.handleOnline);
  }
}
