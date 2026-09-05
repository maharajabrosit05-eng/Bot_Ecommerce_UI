import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/guards/auth.guard';

import { AllProducts } from './shared/components/products/all-products/all-products';
import { AddProduct } from './shared/components/products/add-product/add-product';

import { AdminLayout } from './shared/layout/admin-layout';
import { HomeMenu } from './shared/home-menu/home-menu';
import { UpdateProducts } from './shared/components/products/update-products/update-products';
import { Masters } from './shared/components/products/masters/masters';

import { AllOrders } from './shared/components/orders/all-orders/all-orders';
import { OrderReturns } from './shared/components/orders/order-returns/order-returns';
import { PendingOrders } from './shared/components/orders/pending-orders/pending-orders';
import { CancelOrders } from './shared/components/orders/cancel-orders/cancel-orders';


import { StockOverview } from './shared/components/Inventory/stock-overview/stock-overview';
import { LowStockAlert } from './shared/components/Inventory/low-stock-alert/low-stock-alert';

import { AllCustomers } from './shared/components/customers/all-customers/all-customers';
import { CustomersReview } from './shared/components/customers/customers-review/customers-review';

// ============ Control Panel pages (puthusa add pannirikom) ============
import { MasterMenuGroup } from './pages/control-panel/master-menu-group/master-menu-group';
import { SubMenuGroup } from './pages/control-panel/sub-menu-group/sub-menu-group';
import { MenuAccess } from './pages/control-panel/menu-access/menu-access';

import { NotFound } from './pages/not-found/not-found';
import { NetworkError } from './pages/network-error/network-error';
import { ServerError } from './pages/server-error/server-error';
import { Forbidden } from './pages/forbidden/forbidden';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  /**
   * Standalone status/error pages — ivanga AdminLayout (sidebar) kulla
   * varathu, so logged-in or logged-out edhu scenario layum work aagum.
   */
  { path: 'network-error', component: NetworkError },
  { path: 'server-error', component: ServerError },
  { path: 'forbidden', component: Forbidden },

  /**
   * AdminLayout = common sidebar + topbar shell.
   * Ella authenticated page um ithan children ah than varum,
   * so sidebar ah thani thaniya ovvoru page layum vera vera
   * ezhudha vendam — inga oru edathula than irukku.
   */
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeMenu },
      { path: 'dashboard', component: Dashboard },
      { path: 'all-products', component: AllProducts },
      {
        path: 'update-products/:id',
        component: UpdateProducts
      },

      { path: 'add-product', component: AddProduct },
     
      { path: 'masters', component: Masters },

      { path: 'all_orders', component: AllOrders },
      { path: 'pending_orders', component: PendingOrders },
      { path: 'order_returns', component: OrderReturns },
      { path: 'cancel_orders', component: CancelOrders },


      { path: 'stock_overview', component: StockOverview },
      { path: 'low_stock_alert', component: LowStockAlert },




      { path: 'all_customers', component: AllCustomers },
      { path: 'customer_review', component: CustomersReview },

      // ============ Control Panel routes ============
      // (RouterLink values M_CONTROLPANEL_MODULES seed data la
      //  irukura routes ah vachi than exact ah match panniruken)
      { path: 'control-panel/master-menu-group', component: MasterMenuGroup },
      { path: 'control-panel/sub-menu-group', component: SubMenuGroup },
      { path: 'control-panel/menu-access', component: MenuAccess },

    ]
  },

  // Match aagatha edha URL layum (typo, deleted link, etc.) inga than varum
  { path: '**', component: NotFound }

];
