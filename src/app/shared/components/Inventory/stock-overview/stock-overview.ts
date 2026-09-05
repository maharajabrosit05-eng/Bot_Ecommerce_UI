import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { CommonService } from '../../../../../services/common.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-stock-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './stock-overview.html',
  styleUrl: './stock-overview.scss',
})
export class StockOverview implements OnInit {

  stockList: any[] = [];
  filteredData: any[] = [];
  searchList: any[] = [];

  productOptions: any[] = [];
  locationOptions: any[] = [];

  searchTerm = '';
  locationFilter = 'all';
  statusFilter = 'all'; // all | low | out

  page = 1;
  pageSize = 10;
  totalRecords = 0;

  recordsOptions = [
    { id: 10, name: '10 Records' },
    { id: 25, name: '25 Records' },
    { id: 50, name: '50 Records' },
    { id: 100, name: '100 Records' }
  ];

  statusTabs = [
    { id: 'all', label: 'All Stock' },
    { id: 'low', label: 'Low Stock' },
    { id: 'out', label: 'Out of Stock' }
  ];

  // ---------- KPI ----------
  totalProducts = 0;
  totalStockQty = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  // ---------- Modal (Add / Reduce Stock) - TOP-in modal ----------
  showModal = false;
  panelMode: 'add' | 'reduce' = 'add';
  stockForm: FormGroup;
  saving = false;

  // ---------- Page-level loader ----------
  // FIX: munnadi indha flag "true" nu declare pannitu, loadPageData() oda
  // next()/error() rendulayum "false" ku reset panradhu miss aayiruchu.
  // Adhanala loader (*ngIf="pageLoading") screen-ah permanent ah moodikittu
  // nikkum, data already load aagi irundhaalum kooda -- click pannumbodhu
  // vera event fire aagi change detection run aaguthu, appo dhan already
  // loaded data render aaguthu ("click pannina thaan varudhu" feel).
  // Ippo next() + error() rendulayum pageLoading = false pannitrukom, so
  // data vandha odhane (click illama) automatic ah screen ku varum.
  pageLoading = true;

  // ---------- Logged-in user (for Updated By) ----------
  loggedInUserName = '';

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private alert: AlertService,
  ) {
    this.stockForm = this.fb.group({
      Product_Code: [null, Validators.required],
      Location_Code: [null, Validators.required],
      Qty: [1, [Validators.required, Validators.min(1)]],
      Updated_By: [{ value: '', disabled: true }]   // readonly, auto-filled from login
    });
  }

  ngOnInit(): void {
    this.loggedInUserName = this.getLoggedInUserName();
    this.loadPageData();
  }

  // ==================== Page Load ====================
  loadPageData(): void {
    this.pageLoading = true;

    forkJoin({
      stock: this.commonService.GetItemStockList(),
      products: this.commonService.GetAllProducts()
    }).subscribe({
      next: ({ stock, products }: any) => {
        this.mapStockList(stock);
        this.mapProductDropdown(products);
        this.pageLoading = false;
      },
      error: () => {
        this.stockList = [];
        this.updateDisplayedData();
        this.pageLoading = false;
      }
    });
  }

  private mapStockList(res: any): void {
    const rawList = res?.data || [];

    this.stockList = rawList.map((x: any) => ({
      ...x,
      Product_Name: x.Product_Name,
      Product_Code: x.Product_Code,
      SKU: x.SKU,
      Location_Code: x.Location_Code,
      Location_Name: x.Location_Name || x.Location_Code || '—',
      Stock_Qty: Number(x.Stock_Qty ?? x.CurrentStock ?? 0),
      Minimum_Stock: Number(x.Minimum_Stock ?? 0),
      Maximum_Stock: Number(x.Maximum_Stock ?? 0),
      // FIX: API "Aug 27 2026  1:20PM" mari oru non-standard string
      // anupudhu -- Angular date pipe idha nேrடியா parse panna mudiyama
      // NG02100/NG02311 crash throw pannuchu (adhanala loading spinner
      // nikkave nikkum, table varave varadhu). Ippo raw string-ah nேrடியா
      // template ku kudukama, safe ah Date object ah convert pannitu
      // kudukurom -- parse fail aana null (template "—" kaatum).
      Updated_On: this.parseUpdatedOn(x.Updated_On || x.Created_On),
      Is_Active: (x.Is_Active === 'A' || x.Is_Active === 'Y') ? 'A' : 'D'
    }));

    this.loadLocationDropdown();
    this.calculateKpis();
    this.updateDisplayedData();
  }

  // FIX: Backend "MMM D YYYY  h:mmA" (e.g. "Aug 27 2026  1:20PM") format-ல
  // date anupuchu -- idha native `new Date()` la nேrடியா pass panna palapadhi
  // browser-la parse aagama Invalid Date varum, appuram date pipe crash
  // aagum. Idhukaga: mudhalla native parse try pannurom (ISO string mari
  // valid format vandha odhane use aagum), adhu fail aana intha custom
  // format-ah manual ah regex vachu date-ah build pannurom. Rendume fail
  // aana null return pannurom -- template safe ah "—" kaatum.
  private parseUpdatedOn(raw: any): Date | null {
    if (!raw) { return null; }
    if (raw instanceof Date) {
      return isNaN(raw.getTime()) ? null : raw;
    }

    const str = String(raw).trim();

    const native = new Date(str);
    if (!isNaN(native.getTime())) {
      return native;
    }

    const match = str.match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (!match) {
      return null;
    }

    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const [, monStr, day, year, hourStr, minute, ampm] = match;
    const monthIndex = months[monStr.toLowerCase()];
    if (monthIndex === undefined) { return null; }

    let hour = parseInt(hourStr, 10);
    const isPM = ampm.toUpperCase() === 'PM';
    if (hour === 12) {
      hour = isPM ? 12 : 0;
    } else if (isPM) {
      hour += 12;
    }

    const parsed = new Date(parseInt(year, 10), monthIndex, parseInt(day, 10), hour, parseInt(minute, 10));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private mapProductDropdown(res: any): void {
    const list = res?.data || [];
    this.productOptions = list.map((p: any) => ({
      id: p.Product_Code,
      name: `${p.Product_Name} (${p.Product_Code})`
    }));
  }

  // Manual refresh (e.g. after Add/Reduce Stock) - full page loader illama,
  // silent ah reload pannum, form modal already close aagiruchu
  GetAll(): void {
    this.commonService.GetItemStockList().subscribe({
      next: (res: any) => this.mapStockList(res),
      error: () => {
        this.stockList = [];
        this.updateDisplayedData();
      }
    });
  }

  // ==================== Logged-in User ====================
  getLoggedInUserName(): string {
    try {
      const direct = localStorage.getItem('User_Name') || localStorage.getItem('UserName');
      if (direct) { return direct; }

      const possibleKeys = ['User', 'LoggedInUser', 'CurrentUser', 'UserData', 'User_Details'];
      for (const key of possibleKeys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const name = parsed?.User_Name || parsed?.Name || parsed?.Employee_Name || parsed?.Full_Name;
          if (name) { return name; }
        }
      }
    } catch {
      // JSON parse fail aana silent ah ignore pannitu fallback ku pogum
    }
    return 'Admin';
  }

  // Location master API illama, stock data-lendhe distinct locations edukurom
  loadLocationDropdown(): void {
    const distinct = this.stockList
      .map(x => ({ id: x.Location_Code, name: x.Location_Name }))
      .filter((x, i, arr) => x.id && arr.findIndex(y => y.id === x.id) === i);

    this.locationOptions = [{ id: 'all', name: 'All Locations' }, ...distinct];
  }

  calculateKpis(): void {
    const uniqueProducts = new Set(this.stockList.map(x => x.Product_Code));
    this.totalProducts = uniqueProducts.size;
    this.totalStockQty = this.stockList.reduce((sum, x) => sum + (x.Stock_Qty || 0), 0);
    this.lowStockCount = this.stockList.filter(x => x.Stock_Qty > 0 && x.Stock_Qty <= x.Minimum_Stock).length;
    this.outOfStockCount = this.stockList.filter(x => x.Stock_Qty <= 0).length;
  }

  // ==================== Filters / Search ====================

  getStockStatus(item: any): 'low' | 'out' | 'ok' {
    if (item.Stock_Qty <= 0) return 'out';
    if (item.Minimum_Stock > 0 && item.Stock_Qty <= item.Minimum_Stock) return 'low';
    return 'ok';
  }

  onFilterChange(): void {
    this.page = 1;
    this.updateDisplayedData();
  }

  onStatusTab(tab: string): void {
    this.statusFilter = tab;
    this.onFilterChange();
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
    this.locationFilter = 'all';
    this.statusFilter = 'all';
    this.page = 1;
    this.updateDisplayedData();
  }

  onRecordsChange(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData(): void {
    let data = [...this.stockList];

    if (this.locationFilter !== 'all') {
      data = data.filter(x => x.Location_Code === this.locationFilter);
    }

    if (this.statusFilter !== 'all') {
      data = data.filter(x => this.getStockStatus(x) === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(item =>
        Object.values(item).some(value =>
          value != null && value.toString().toLowerCase().includes(term)
        )
      );
    }

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

  // ==================== Add / Reduce Stock — TOP MODAL ====================

  openAddStockPanel(product?: any): void {
    this.panelMode = 'add';
    this.stockForm.reset({ Qty: 1 });
    this.stockForm.patchValue({ Updated_By: this.loggedInUserName });
    if (product) {
      this.stockForm.patchValue({
        Product_Code: product.Product_Code,
        Location_Code: product.Location_Code
      });
    }
    this.showModal = true;
  }

  openReduceStockPanel(product: any): void {
    this.panelMode = 'reduce';
    this.stockForm.reset({ Qty: 1 });
    this.stockForm.patchValue({
      Product_Code: product.Product_Code,
      Location_Code: product.Location_Code,
      Updated_By: this.loggedInUserName
    });
    this.showModal = true;
  }

  closePanel(): void {
    this.showModal = false;
    this.stockForm.reset({ Qty: 1 });
  }

  incrementQty(): void {
    const current = Number(this.stockForm.get('Qty')?.value) || 0;
    this.stockForm.patchValue({ Qty: current + 1 });
  }

  decrementQty(): void {
    const current = Number(this.stockForm.get('Qty')?.value) || 1;
    this.stockForm.patchValue({ Qty: current > 1 ? current - 1 : 1 });
  }

  // FIX: manual typing panna, negative/zero/junk type pannitanga na, blur
  // aagumbodhu 1 ku auto-correct aagum (onQtyBlur). During typing free ah
  // edit panna anumadhikurom.
  onQtyBlur(): void {
    const current = Number(this.stockForm.get('Qty')?.value);
    if (!current || current < 1) {
      this.stockForm.patchValue({ Qty: 1 });
    }
  }

  submitStock(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    // FIX: Updated_By disabled control-la irundhalum getRawValue() la
    // include aagum, appadi than payload full ah pogum
    const payload = this.stockForm.getRawValue();

    const request$ = this.panelMode === 'add'
      ? this.commonService.AddStockQty(payload)
      : this.commonService.ReduceStockQty(payload);

    request$.subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res?.status === false) {
          this.alert.error(res.message || 'Stock update failed.');
          return;
        }
        this.alert.toast(this.panelMode === 'add' ? 'Stock added successfully' : 'Stock reduced successfully');
        this.closePanel();
        this.GetAll();
      },
      error: () => {
        this.saving = false;
        this.alert.error('Stock update aaga mudiyala, try again.');
      }
    });
  }

  // ==================== Image ====================

  // ---------- Default image path ----------
  defaultProductImage = 'assets/images/no-image.png';

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