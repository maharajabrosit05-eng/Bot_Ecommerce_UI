import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuItem, MenuService } from '../services/menu.service';

/**
 * ==================================================================
 * HomeMenu
 * ------------------------------------------------------------------
 * Sidebar ku pathila, ippo app ellam ithu vachi than navigate pandrom.
 * Level 1 la HomeMenu groups (Dashboard, Control Panel, Customers,
 * Products, Orders, Inventory...) cards ah kaatum. Group ku multiple
 * modules irundha, click pannina andha group oda modules Level 2 la
 * cards ah varum. Module ku RouterLink irundha, nera andha page ku
 * navigate pannidum.
 * ==================================================================
 */
@Component({
  selector: 'app-home-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-menu.html',
  styleUrl: './home-menu.scss'
})
export class HomeMenu implements OnInit, AfterViewInit {

  menu: MenuItem[] = [];

  /** null = level 1 (group cards). set = level 2 (that group's modules) */
  activeGroup: MenuItem | null = null;

  @ViewChild('bgVideo')
  bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(private menuService: MenuService, private router: Router) { }

  ngOnInit(): void {
    this.menu = this.menuService.getMenu();
  }

  ngAfterViewInit(): void {
    // Force the background video to auto-play (login page logic same).
    const video = this.bgVideo?.nativeElement;
    if (!video) {
      return;
    }
    video.muted = true;
    video.autoplay = true;
    video.loop = true;

    video.load();

    video.play().catch(() => {
      setTimeout(() => {
        video.play();
      }, 100);
    });
  }

  openItem(item: MenuItem): void {
    if (item.children && item.children.length) {
      this.activeGroup = item;
      return;
    }

    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  backToGroups(): void {
    this.activeGroup = null;
  }
}
