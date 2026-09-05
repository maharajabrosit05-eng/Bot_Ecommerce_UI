import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;   // link kudukama vittal, last item mari plain text ah than varum
  icon?: string;    // optional remixicon class, e.g. 'ri-home-4-line'
}

/**
 * <app-breadcrumb [items]="breadcrumbs"></app-breadcrumb>
 *
 * Ella page layum inga vandhu [items] input kudutha podhum,
 * style, HTML ellam ready ah irukkum (bootstrap breadcrumb).
 *
 * Example:
 *   breadcrumbs: BreadcrumbItem[] = [
 *     { label: 'Dashboard', link: '/dashboard', icon: 'ri-home-4-line' },
 *     { label: 'Products' },
 *     { label: 'All Products' }
 *   ];
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrls: ['./breadcrumb.scss']
})
export class Breadcrumb {
  @Input() items: BreadcrumbItem[] = [];
}
