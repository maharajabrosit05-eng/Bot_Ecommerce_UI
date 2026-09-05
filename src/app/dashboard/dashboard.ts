import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  constructor(private commonService: CommonService) { }

  /* ---------- Greeting ---------- */
  today: Date = new Date();
  greeting: string = this.getGreeting();
  dateLabel: string = this.getDateLabel();

  ngOnInit(): void {
    this.loadLiveCounts();
  }

  /**
   * Idhu varaikkum statCards la "Total Revenue / Total Orders / Conversion
   * Rate" ellam fixed demo numbers ($48,921 etc.) — backend la revenue/orders
   * report API ("Services/common.service.ts" la check pannen) illa, so andha
   * cards ah touch pannala. "Total Products" & "Total Leads" (-> Total
   * Customers ah rename pannirukom) ku API already irukku (GetAllProducts,
   * GetCustomerList), so andha rendu cards ah real count vachu dynamic ah
   * maathirukom. Revenue/Orders/Conversion Rate API varum pothu, idhe pattern
   * follow pannitu vera 2 cards layum wire pannikalam.
   */
  private loadLiveCounts(): void {
    this.commonService.GetAllProducts().subscribe({
      next: (res: any) => {
        const count = (res?.data || []).length;
        const card = this.statCards.find(c => c.label === 'Total Products');
        if (card) { card.value = count.toLocaleString('en-IN'); }
      },
      error: () => { /* API fail aana, demo value athuve nikkum */ }
    });

    this.commonService.GetCustomerList().subscribe({
      next: (res: any) => {
        const count = (res?.data || []).length;
        const card = this.statCards.find(c => c.label === 'Total Customers');
        if (card) { card.value = count.toLocaleString('en-IN'); }
      },
      error: () => { /* API fail aana, demo value athuve nikkum */ }
    });
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  private getDateLabel(): string {
    return this.today.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ---------- KPI Stat Cards ---------- */
  statCards = [
    {
      label: 'Total Revenue', value: '$48,921', delta: '+12%', up: true,
      sub: 'vs. previous 30 days', icon: 'ri-money-dollar-circle-line',
      color: '#4f46e5', spark: [8, 12, 10, 16, 14, 20, 18, 24, 22, 28]
    },
    {
      label: 'Total Customers', value: '2,947', delta: '+21%', up: true,
      sub: 'Live count from API', icon: 'ri-user-add-line',
      color: '#059669', spark: [6, 9, 8, 12, 11, 15, 14, 18, 17, 21]
    },
    {
      label: 'Total Products', value: '1,438', delta: '+15%', up: true,
      sub: 'Live count from API', icon: 'ri-shopping-cart-line',
      color: '#d97706', spark: [10, 8, 12, 9, 14, 12, 16, 15, 19, 22]
    },
    {
      label: 'Conversion Rate', value: '5.2%', delta: '+9%', up: true,
      sub: 'Rolling average', icon: 'ri-percent-line',
      color: '#e11d48', spark: [12, 14, 13, 16, 15, 18, 17, 20, 19, 22]
    }
  ];

/* ---------- Sparkline shared config ---------- */
  sparkChart: any = {
    type: 'line', height: 46, toolbar: { show: false },
    sparkline: { enabled: true }
  };
  sparkStroke: any = { curve: 'smooth', width: 2.5 };
  sparkFill: any = { type: 'solid', opacity: 0.05 };
  sparkTooltip: any = { theme: 'light' };
  sparkXaxis: any = { categories: [] };
  sparkYaxis: any = { min: 0 };
  sparkGrid: any = { show: false };
  sparkDataLabels: any = { enabled: false };

  /* ---------- Revenue area chart ---------- */
  revenueChart: any = {
    series: [
      { name: 'Revenue', data: [42000, 51000, 48000, 62000, 58000, 72000, 68000, 82000, 76000, 91000, 86000, 98000] },
      { name: 'Orders',  data: [1200, 1400, 1350, 1600, 1550, 1800, 1750, 2000, 1950, 2200, 2100, 2400] }
    ],
    chart: {
      type: 'area', height: 320, toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      foreColor: '#64748b',
      zoom: { enabled: false }
    },
    colors: ['#4f46e5', '#22c1c3'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: .35, opacityTo: .02, stops: [0, 90, 100] }
    },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px', fontWeight: 600 },
    grid: { borderColor: '#eef1f6', strokeDashArray: 4 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8' },
        formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : String(v)
      }
    },
    tooltip: {
      theme: 'light',
      x: { format: 'dd MMM yyyy' }
    }
  };

  /* ---------- Sales by category donut ---------- */
  categoryChart: any = {
    series: [38, 27, 20, 15],
    chart: { type: 'donut', height: 260, toolbar: { show: false } },
    labels: ['Electronics', 'Fashion', 'Home & Living', 'Accessories'],
    colors: ['#4f46e5', '#22c1c3', '#f6b93b', '#fd7272'],
    legend: { position: 'bottom', fontSize: '13px', fontWeight: 500, markers: { size: 6 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '72%', labels: { show: true, value: { fontSize: '22px', fontWeight: 700 }, total: { show: true, label: 'Total', color: '#64748b', fontSize: '13px' } } } } },
    tooltip: { theme: 'light' }
  };

  /* ---------- Top products progress list ---------- */
  topProducts = [
    { name: 'Wireless Headphones', sold: 1240, pct: 86, color: '#4f46e5' },
    { name: 'Smart Watch',        sold: 978,  pct: 72, color: '#22c1c3' },
    { name: 'Bluetooth Speaker',  sold: 740,  pct: 58, color: '#f6b93b' },
    { name: 'Laptop Backpack',    sold: 462,  pct: 41, color: '#fd7272' }
  ];

  /* ---------- Campaign performance bar chart ---------- */
  campaignChart: any = {
    series: [{ name: 'Spend', data: [180000, 420000, 260000, 210000, 460000, 340000] }],
    chart: { type: 'bar', height: 220, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
    colors: ['#4f46e5', '#22c1c3', '#fd7272', '#cbd5e1', '#059669', '#f6b93b'],
    legend: { show: false },
    xaxis: { categories: ['Organic', 'Paid Search', 'Social', 'Referral', 'Direct', 'Email'], labels: { style: { colors: '#94a3b8' } } },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: '#eef1f6' },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' }
  };

  /* ---------- Drop-in-conversions mini bar chart ---------- */
  conversionDropChart: any = {
    series: [{ name: 'Conversions', data: [227, 340, 190, 165, 260, 175, 120] }],
    chart: { type: 'bar', height: 160, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%', distributed: true } },
    colors: ['#cbd5e1', '#4f46e5', '#cbd5e1', '#a5d8ff', '#fd7272', '#f6b93b', '#cbd5e1'],
    legend: { show: false },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Organic', 'Search', 'Social', 'Media', 'Referral', 'Email', 'Direct'], labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
    grid: { show: false }
  };

  /* ---------- What's working / channel ---------- */
  topCampaigns = [
    { name: 'Webinar Promo', value: '$18,271', roas: '6.7 ROAS', up: true },
    { name: 'Product Ads',   value: '$14,135', roas: '4.2 ROAS', up: true },
    { name: 'SEO Content',   value: '$9,852',  roas: '6.1 ROAS', up: false }
  ];

  channelComparison = [
    { name: 'Organic Search', value: '25,318', delta: '+18%', pct: 82, color: '#059669' },
    { name: 'Paid Search',    value: '18,257', delta: '+32%', pct: 64, color: '#4f46e5' },
    { name: 'Social Media',   value: '9,275',  delta: '+25%', pct: 38, color: '#fd7272' }
  ];

  alerts = [
    { title: 'Landing Page /project-x', detail: 'Traffic dropped 17% — consider A/B testing new headlines.', tone: 'danger' }
  ];

  recommendations = [
    { title: 'Increase budget for Webinar Promo', detail: 'Consistently outperforming — scale spend.', delta: '+15%', tone: 'success' },
    { title: 'Optimize landing page /project-x', detail: 'Page has weak conversion on mobile.',        delta: '+43%', tone: 'warning' },
    { title: 'Pause Retargeting Ads',              detail: 'ROAS below threshold for 14 days.',         delta: '-9%',  tone: 'danger' }
  ];

  /* ---------- Audience insight radial gauges ---------- */
  genderChart: any = {
    series: [42, 58],
    chart: { type: 'donut', height: 130 },
    labels: ['Men', 'Women'],
    colors: ['#4f46e5', '#f6b93b'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%' } } }
  };

  makeRadial(value: number, color: string): any {
    return {
      series: [value],
      chart: { type: 'radialBar', height: 110 },
      colors: [color],
      plotOptions: {
        radialBar: {
          hollow: { size: '55%' },
          dataLabels: {
            value: { fontSize: '15px', fontWeight: 700, formatter: (v: number) => v + '%' },
            name: { show: false }
          }
        }
      }
    };
  }

  newVisitorsChart = this.makeRadial(68, '#4f46e5');
  returningChart   = this.makeRadial(32, '#22c1c3');
  desktopChart     = this.makeRadial(55, '#f6b93b');
  emailChart       = this.makeRadial(87, '#059669');

  ageBrackets = [
    { label: '18-24', pct: 22 },
    { label: '25-34', pct: 38 },
    { label: '35-44', pct: 26 },
    { label: '45-54', pct: 10 },
    { label: '55+',   pct: 4 }
  ];

  recentOrders = [
    { id: '#GM-1042', customer: 'Aditi Sharma', channel: 'Webinar Promo', amount: '$1,240', status: 'Won' },
    { id: '#GM-1043', customer: 'Rahul Verma',  channel: 'Product Ads',   amount: '$860',   status: 'Pending' },
    { id: '#GM-1044', customer: 'Sana Khan',    channel: 'SEO Content',   amount: '$2,110', status: 'Won' },
    { id: '#GM-1045', customer: 'David Jose',   channel: 'Direct',        amount: '$540',   status: 'Pending' },
    { id: '#GM-1046', customer: 'Meera Nair',   channel: 'Product Ads',   amount: '$1,780', status: 'Won' }
  ];

  /* ---------- Initials for avatar bubble ---------- */
  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#4f46e5', '#059669', '#d97706', '#e11d48', '#0e7490', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
