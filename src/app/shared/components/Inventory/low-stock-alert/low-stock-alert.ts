import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from '../../../../../services/common.service';

/**
 * LowStockAlert
 * ------------------------------------------------------------
 * TODO (Maharaja ku): "loading rompa neram varum" issue ku REAL fix
 * - root-level AppLoader + LoadingService oda loading.interceptor.ts
 * ovvoru HttpClient call layum automatic ah trigger aagi, video loader
 * kaatikkum, adhu than intha page open aana odhane long-time-loading
 * feel kuduthu. Idha correct ah fix panna:
 *
 *   1) `common.service.ts` la GetItemStockList() ku optional
 *      `context?: HttpContext` parameter add pannanum
 *   2) `loading.interceptor.ts` la SKIP_LOADER context check panni,
 *      andha specific call ku loader skip panra logic add pannanum
 *   3) Inga GetAll() la `this.commonService.GetItemStockList(
 *      new HttpContext().set(SKIP_LOADER, true))` nu pass pannanum
 *
 * Andha 2 files (common.service.ts, loading.interceptor.ts) share
 * pannunga, complete ah wire pannitharen. Adhuvaraikkum, idha simple
 * ah subscribe pannitu vachirukom (unused HttpContext import edutten -
 * build error tharudhu, use pannama vachurundhadhala).
 * ------------------------------------------------------------
 */
@Component({
  selector: 'app-low-stock-alert',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './low-stock-alert.html',
  styleUrl: './low-stock-alert.scss',
})
export class LowStockAlert implements OnInit {

  allAlerts: any[] = [];
  filteredData: any[] = [];
  searchList: any[] = [];

  searchTerm = '';
  severityFilter: 'all' | 'low' | 'out' = 'all';

  page = 1;
  pageSize = 10;
  totalRecords = 0;

  recordsOptions = [
    { id: 10, name: '10 Records' },
    { id: 25, name: '25 Records' },
    { id: 50, name: '50 Records' },
    { id: 100, name: '100 Records' }
  ];

  severityTabs: { id: 'all' | 'low' | 'out'; label: string }[] = [
    { id: 'all', label: 'All Alerts' },
    { id: 'low', label: 'Low Stock' },
    { id: 'out', label: 'Out of Stock' }
  ];
  // ---------- KPI ----------
  lowStockCount = 0;
  outOfStockCount = 0;
  totalAlerts = 0;
  criticalCount = 0; // out of stock, treated as highest severity

  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
    this.GetAll();
  }

  // ==================== Load ====================
  GetAll(): void {
    this.commonService.GetItemStockList().subscribe({
      next: (res: any) => {
        const rawList = res?.data || [];

        const mapped = rawList.map((x: any) => ({
          ...x,
          Product_Name: x.Product_Name,
          Product_Code: x.Product_Code,
          SKU: x.SKU,
          Location_Code: x.Location_Code,
          Location_Name: x.Location_Name || x.Location_Code || '—',
          Stock_Qty: Number(x.Stock_Qty ?? x.CurrentStock ?? 0),
          Minimum_Stock: Number(x.Minimum_Stock ?? 0),
          Maximum_Stock: Number(x.Maximum_Stock ?? 0),
          Updated_On: x.Updated_On || x.Created_On
        }));

        // Low Stock Alert page la In-Stock (ok) items venaam -- low/out mattum
        this.allAlerts = mapped.filter((x: any) => this.getSeverity(x) !== 'ok');

        this.calculateKpis();
        this.updateDisplayedData();
      },
      error: () => {
        this.allAlerts = [];
        this.updateDisplayedData();
      }
    });
  }

  // ==================== Severity ====================

  getSeverity(item: any): 'low' | 'out' | 'ok' {
    if (item.Stock_Qty <= 0) return 'out';
    if (item.Minimum_Stock > 0 && item.Stock_Qty <= item.Minimum_Stock) return 'low';
    return 'ok';
  }

  calculateKpis(): void {
    this.totalAlerts = this.allAlerts.length;
    this.lowStockCount = this.allAlerts.filter(x => this.getSeverity(x) === 'low').length;
    this.outOfStockCount = this.allAlerts.filter(x => this.getSeverity(x) === 'out').length;
    this.criticalCount = this.outOfStockCount;
  }

  // ==================== Filters / Search ====================

  onSeverityTab(tab: 'all' | 'low' | 'out'): void {
    this.severityFilter = tab;
    this.page = 1;
    this.updateDisplayedData();
  }

  onSearch(): void {
    this.page = 1;
    this.updateDisplayedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.severityFilter = 'all';
    this.page = 1;
    this.updateDisplayedData();
  }

  onRecordsChange(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData(): void {
    let data = [...this.allAlerts];

    if (this.severityFilter !== 'all') {
      data = data.filter(x => this.getSeverity(x) === this.severityFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(item =>
        Object.values(item).some(value =>
          value != null && value.toString().toLowerCase().includes(term)
        )
      );
    }

    // Critical (out of stock) items mudhalla varum
    data.sort((a, b) => {
      const sevA = this.getSeverity(a) === 'out' ? 0 : 1;
      const sevB = this.getSeverity(b) === 'out' ? 0 : 1;
      return sevA - sevB;
    });

    this.totalRecords = data.length;
    this.filteredData = data;

    const start = (this.page - 1) * this.pageSize;
    this.searchList = data.slice(start, start + this.pageSize);
  }

  get startRecord(): number {
    return this.totalRecords === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.page * this.pageSize, this.totalRecords);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.updateDisplayedData();
  }

  // ==================== Helpers ====================

  // Reorder suggestion: max stock ah target vachi, evlo order pannanum-nu kaatum
  getSuggestedReorderQty(item: any): number {
    if (item.Maximum_Stock > 0) {
      return Math.max(item.Maximum_Stock - item.Stock_Qty, 0);
    }
    // Max stock illainaa, min stock oda 2x ah default suggest pannurom
    return Math.max((item.Minimum_Stock || 5) * 2 - item.Stock_Qty, 0);
  }

  // ==================== Image ====================

  defaultProductImage =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
        <rect width="80" height="80" rx="8" fill="#f1f5f9"/>
        <path d="M24 52l10-12 8 9 6-7 12 15H24z" fill="#cbd5e1"/>
        <circle cx="30" cy="28" r="6" fill="#cbd5e1"/>
      </svg>
    `);

  getProductImageSrc(imageData: string | null | undefined): string {
    if (imageData && imageData.trim() !== '') {
      if (imageData.startsWith('data:image')) {
        return imageData;
      }
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData;
      }
      return `data:image/png;base64,${imageData}`;
    }
    return this.defaultProductImage;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target.src !== this.defaultProductImage) {
      target.src = this.defaultProductImage;
    }
  }
}