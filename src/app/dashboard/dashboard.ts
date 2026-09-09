import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  ngOnInit(): void {}

  /* ---------- Topbar ---------- */
  storeName = 'ElectroKart';
  storeTagline = 'Smart Electronics. Smarter Living.';
  adminName = 'Maharaja M';
  adminRole = 'Administrator';
  notificationCount = 5;
  isDarkMode = false;
  mobileSearchOpen = false;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
  }

  /* ---------- Hero ---------- */
  heroBadges = [
    { icon: 'ri-shopping-bag-3-line', label: 'Wide Range Products' },
    { icon: 'ri-shield-check-line', label: '100% Secure Transactions' },
    { icon: 'ri-truck-line', label: 'Fast & Reliable Delivery' },
    { icon: 'ri-headphone-line', label: '24/7 Support' }
  ];

  heroProducts = [
    { icon: 'ri-macbook-line' },
    { icon: 'ri-smartphone-line' },
    { icon: 'ri-headphone-line' },
    { icon: 'ri-timer-2-line' }
  ];

  /* ---------- KPI Stat Cards ---------- */
  statCards = [
    { label: 'Total Orders', value: '1,245', delta: '12%', up: true, sub: 'vs last month',
      icon: 'ri-shopping-cart-2-line', bg: '#8b5cf6', spark: [4, 6, 5, 8, 7, 10, 9, 12, 11, 14] },
    { label: 'Total Revenue', value: '\u20B94,82,350', delta: '18%', up: true, sub: 'vs last month',
      icon: 'ri-money-rupee-circle-line', bg: '#3b82f6', spark: [5, 7, 6, 9, 8, 12, 10, 14, 13, 16] },
    { label: 'Total Products', value: '856', delta: '5%', up: true, sub: 'vs last month',
      icon: 'ri-archive-2-line', bg: '#f59e0b', spark: [8, 7, 9, 8, 10, 9, 11, 10, 12, 13] },
    { label: 'Total Customers', value: '2,430', delta: '22%', up: true, sub: 'vs last month',
      icon: 'ri-team-line', bg: '#10b981', spark: [6, 8, 7, 10, 9, 13, 12, 15, 14, 17] },
    { label: 'Store Visitors', value: '12,580', delta: '16%', up: true, sub: 'vs last month',
      icon: 'ri-eye-line', bg: '#ec4899', spark: [7, 9, 8, 11, 10, 13, 12, 15, 14, 18] }
  ];

  sparkChart: any = { type: 'line', height: 44, toolbar: { show: false }, sparkline: { enabled: true } };
  sparkStroke: any = { curve: 'smooth', width: 2.5 };
  sparkFill: any = { type: 'solid', opacity: 0 };
  sparkTooltip: any = { enabled: false };
  sparkGrid: any = { show: false };
  sparkDataLabels: any = { enabled: false };
  sparkXaxis: any = { categories: [] };
  sparkYaxis: any = { min: 0 };

  /* ---------- Sales Analytics (orders bar + revenue line combo) ---------- */
  salesRanges = ['Last 7 Days', 'Last 30 Days', 'Last 12 Months'];
  salesRange = 'Last 7 Days';

  salesAnalyticsChart: any = {
    series: [
      { name: 'Orders', type: 'column', data: [110, 95, 130, 100, 150, 175, 195] },
      { name: 'Revenue', type: 'line', data: [90000, 70000, 105000, 95000, 140000, 165000, 195000] }
    ],
    chart: { height: 320, type: 'line', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', foreColor: '#64748b' },
    stroke: { width: [0, 3], curve: 'smooth' },
    plotOptions: { bar: { columnWidth: '42%', borderRadius: 5 } },
    colors: ['#0d5a0d', '#f6cf0b'],
    fill: { opacity: [1, 1] },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px', fontWeight: 600 },
    grid: { borderColor: '#eef1f6', strokeDashArray: 4 },
    xaxis: {
      categories: ['Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8', 'Sep 9'],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: [
      { title: { text: 'Orders', style: { color: '#94a3b8', fontSize: '11px' } }, labels: { style: { colors: '#94a3b8' } } },
      {
        opposite: true,
        title: { text: 'Revenue (\u20B9)', style: { color: '#94a3b8', fontSize: '11px' } },
        labels: {
          style: { colors: '#94a3b8' },
          formatter: (v: number) => v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v >= 1000 ? (v / 1000) + 'k' : String(v)
        }
      }
    ],
    tooltip: { theme: 'light', shared: true }
  };

  /* ---------- Order Status donut ---------- */
  orderStatusRange = 'Last 7 Days';
  totalOrders = 1245;
  orderStatusList = [
    { label: 'Delivered', count: 620, pct: '49.8%', color: '#10b981' },
    { label: 'Processing', count: 310, pct: '24.9%', color: '#3b82f6' },
    { label: 'Shipped', count: 180, pct: '14.5%', color: '#f59e0b' },
    { label: 'Cancelled', count: 85, pct: '6.8%', color: '#ef4444' },
    { label: 'Returned', count: 50, pct: '4.0%', color: '#94a3b8' }
  ];
  orderStatusChart: any = {
    series: [620, 310, 180, 85, 50],
    chart: { type: 'donut', height: 230 },
    labels: ['Delivered', 'Processing', 'Shipped', 'Cancelled', 'Returned'],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#94a3b8'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: { fontSize: '24px', fontWeight: 800, offsetY: -4 },
            total: { show: true, label: 'Total Orders', color: '#64748b', fontSize: '12px', fontWeight: 600 }
          }
        }
      }
    },
    tooltip: { theme: 'light' }
  };

  /* ---------- Top Selling Products ---------- */
  topSellingProducts = [
    { name: 'HP Laptop 15s', sold: 245, pct: 28, icon: 'ri-macbook-line', color: '#3b82f6' },
    { name: 'iPhone 15', sold: 198, pct: 23, icon: 'ri-smartphone-line', color: '#ec4899' },
    { name: 'Sony Headphones', sold: 120, pct: 14, icon: 'ri-headphone-line', color: '#f59e0b' },
    { name: 'Canon Printer', sold: 96, pct: 11, icon: 'ri-printer-line', color: '#8b5cf6' },
    { name: 'Samsung TV 43"', sold: 82, pct: 9, icon: 'ri-tv-2-line', color: '#10b981' }
  ];

  /* ---------- Promo banners ---------- */
  promoBanners = [
    { theme: 'sale', eyebrow: 'BIG ELECTRONICS', title: 'SALE', subtitle: 'Up to 70% OFF',
      badge: 'LIMITED TIME', cta: 'Manage Banners', icon: 'ri-flashlight-line' },
    { theme: 'arrivals', eyebrow: 'New', title: 'Arrivals', subtitle: 'Latest Gadgets for a Smarter You!',
      cta: 'Add Products', icon: 'ri-smartphone-line' },
    { theme: 'trending', eyebrow: '', title: 'Trending Accessories', subtitle: 'Small Gadgets. Big Impact.',
      cornerNote: 'Upgrade Your Everyday', cta: 'View Offers', icon: 'ri-keyboard-line' }
  ];

  /* ---------- Recent Orders ---------- */
  recentOrders = [
    { id: '#ORD1001', customer: 'Arun Kumar', items: 2, amount: '\u20B924,990', status: 'Delivered', date: 'Sep 9, 2026' },
    { id: '#ORD1002', customer: 'Priya S', items: 1, amount: '\u20B912,499', status: 'Processing', date: 'Sep 9, 2026' },
    { id: '#ORD1003', customer: 'Ramesh K', items: 3, amount: '\u20B945,800', status: 'Shipped', date: 'Sep 8, 2026' },
    { id: '#ORD1004', customer: 'Divya M', items: 1, amount: '\u20B98,999', status: 'Delivered', date: 'Sep 8, 2026' },
    { id: '#ORD1005', customer: 'Santhosh V', items: 2, amount: '\u20B932,990', status: 'Cancelled', date: 'Sep 7, 2026' }
  ];

  /* ---------- Low Stock Alert ---------- */
  lowStockItems = [
    { name: 'HP Laptop 15s', icon: 'ri-macbook-line', stock: 3 },
    { name: 'iPhone 15', icon: 'ri-smartphone-line', stock: 5 },
    { name: 'Sony Headphones', icon: 'ri-headphone-line', stock: 4 },
    { name: 'Canon Printer', icon: 'ri-printer-line', stock: 2 },
    { name: 'Samsung TV 43"', icon: 'ri-tv-2-line', stock: 6 }
  ];

  /* ---------- Recent Customers ---------- */
  recentCustomers = [
    { name: 'Arun Kumar', email: 'arun.kumar@mail.com', joined: 'Sep 9, 2026' },
    { name: 'Priya S', email: 'priya.s@mail.com', joined: 'Sep 9, 2026' },
    { name: 'Ramesh K', email: 'ramesh.k@mail.com', joined: 'Sep 8, 2026' },
    { name: 'Divya M', email: 'divya.m@mail.com', joined: 'Sep 8, 2026' },
    { name: 'Santhosh V', email: 'santhosh.v@mail.com', joined: 'Sep 7, 2026' }
  ];

  /* ---------- Footer status bar ---------- */
  footerStats = {
    ordersWaiting: 320,
    outOfStock: 3,
    newCustomers: 5
  };

  /* ---------- Helpers ---------- */
  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#4f46e5', '#059669', '#d97706', '#e11d48', '#0e7490', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  stockClass(stock: number): string {
    return stock <= 3 ? 'critical' : 'low';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Delivered: 'won', Processing: 'processing', Shipped: 'shipped',
      Cancelled: 'cancelled', Returned: 'returned'
    };
    return map[status] || 'pending';
  }
}