import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../services/menu.service';
import type { MenuItem } from '../services/menu.service';

export type { MenuItem };

/**
 * NOTE: Ippo AdminLayout la idha use pannala (top navbar + Home Menu
 * grid page dhaan ippo navigation) — aana component ah remove pannama
 * vachirukom, edhachu future ah thirumba venumna use pannalam nu.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  /** controls the off-canvas open state on mobile/tablet */
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  activeLink = 'Dashboard';

  menu: MenuItem[] = [];

  constructor(private router: Router, private menuService: MenuService) { }

  ngOnInit(): void {
    this.menu = this.menuService.getMenu();
  }

  toggleChildren(item: MenuItem): void {

    if (item.children) {
      item.open = !item.open;
      return;
    }

    if (item.link) {
      this.router.navigate([item.link]);
    }

    this.setActive(item.label);
  }


  setActive(label: string): void {
    this.activeLink = label;
    // auto-close on mobile after selecting a leaf link
    if (window.innerWidth < 1024) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeSidebar.emit();
  }
}
