import { Injectable } from '@angular/core';

export interface MenuItem {
  label: string;
  icon: string;       // remixicon class e.g. 'ri-dashboard-line'
  link?: string;
  children?: MenuItem[];
  open?: boolean;      // runtime state for expand/collapse (used by old sidebar)
}

/**
 * ==================================================================
 * MenuService
 * ------------------------------------------------------------------
 * Sidebar poi, ippo navigation ku "Home Menu" grid page (app-home-menu)
 * use pannurom. Aana menu data eppadi build aagum nu logic rendu
 * edathulayum (navbar Home button ku badge/shortcuts venumna, home-menu
 * page ku) same ah irukanum-nu, andha logic ah inga oru service ah
 * extract pannirukom — single source of truth.
 *
 * Login success aana odane auth.service.ts, role ku access iruka
 * modules ah 'User_Rights' localStorage la save pannidum
 * (api/MenuAccess/accessMenu -> get_AccessMenu SP). Ithuvachi
 * Home Menu (M_CONTROLPANEL_MENUGROUP) -> Sub Menu
 * (M_CONTROLPANEL_MODULES) structure ah build pannuvom.
 * ==================================================================
 */
@Injectable({ providedIn: 'root' })
export class MenuService {

  getMenu(): MenuItem[] {
    const raw = localStorage.getItem('User_Rights');

    if (!raw) {
      return this.fallbackMenu();
    }

    let rights: any[] = [];
    try {
      rights = JSON.parse(raw);
    } catch {
      rights = [];
    }

    if (!rights.length) {
      return this.fallbackMenu();
    }

    // 1) Unique HomeMenu list, groupIndex (Home Menu master oda real
    //    order) vachi sort pannurom.
    const homeMenuNames = Array.from(new Set(rights.map((r) => r.HomeMenu)));

    const homeMenus = homeMenuNames
      .map((hm) => rights.find((r) => r.HomeMenu === hm))
      .sort((a, b) => {
        const ag = Number(a?.groupIndex ?? a?.Display_Order ?? 99);
        const bg = Number(b?.groupIndex ?? b?.Display_Order ?? 99);
        return ag - bg;
      });

    // 'DASHBOARD' ah eppovum first ah nikka pannurom.
    const dashIdx = homeMenus.findIndex((hm) => (hm?.HomeMenu || '').toUpperCase() === 'DASHBOARD');
    if (dashIdx > 0) {
      const [dash] = homeMenus.splice(dashIdx, 1);
      homeMenus.unshift(dash);
    }

    // 2) Ovvoru HomeMenu kum, adhoda children (Module list) build pannurom
    return homeMenus.map((hm) => {

      const children: MenuItem[] = rights
        .filter((r) => r.HomeMenu === hm.HomeMenu)
        .sort((a, b) => Number(a.Display_Order ?? 0) - Number(b.Display_Order ?? 0))
        .map((r) => ({
          label: r.Module,
          icon: r.SubMenuIcon || 'ri-checkbox-blank-circle-line',
          link: r.RouterLink || undefined
        }));

      // Ore Module mattum irundhu, andha Module peru HomeMenu peruku
      // same ah irundha, children venam, nera top-level link ah kaatidalam.
      if (children.length === 1 && children[0].label === hm.HomeMenu) {
        return {
          label: hm.HomeMenu,
          icon: hm.SubMenuIcon || children[0].icon || 'ri-apps-2-line',
          link: children[0].link,
          open: false
        };
      }

      return {
        label: hm.HomeMenu,
        icon: hm.SubMenuIcon || 'ri-apps-2-line',
        open: false,
        children
      };
    });
  }

  /** User_Rights illama irundha kaatanuma minimal static fallback */
  private fallbackMenu(): MenuItem[] {
    return [
      { label: 'Dashboard', icon: 'ri-dashboard-line', link: '/dashboard' }
    ];
  }
}
