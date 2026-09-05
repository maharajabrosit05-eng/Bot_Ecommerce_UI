import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLoader } from './shared/components/app-loader/app-loader';
import { OfflineBanner } from './shared/components/offline-banner/offline-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppLoader, OfflineBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('growth-admin');
}
