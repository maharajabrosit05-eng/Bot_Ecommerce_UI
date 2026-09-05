// all-orders.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './all-orders.html',
  styleUrls: ['./all-orders.scss']
})
export class AllOrders implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  //========================================
  // Variables
  //========================================

  orderList: any[] = [];

  searchList: any[] = [];

  loading = false;

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  searchText = '';

  statusFilter = 'ALL';

  //========================================
  // Records Dropdown
  //========================================

  recordsOptions = [
    { id: 10, name: '10 Records' },
    { id: 25, name: '25 Records' },
    { id: 50, name: '50 Records' },
    { id: 100, name: '100 Records' }
  ];

  //========================================
  // Status Options
  //========================================

  statusOptions = [
    { id: 'ALL', name: 'All Status' },
    { id: 'Order Placed', name: 'Order Placed' },
    { id: 'Packed', name: 'Packed' },
    { id: 'Shipped', name: 'Shipped' },
    { id: 'Out For Delivery', name: 'Out For Delivery' },
    { id: 'Delivered', name: 'Delivered' },
    { id: 'Cancelled', name: 'Cancelled' },
    { id: 'Returned', name: 'Returned' }
  ];

  editStatusOptions = this.statusOptions.filter(s => s.id !== 'ALL');

  //========================================
  // View Modal
  //========================================

  showViewModal = false;

  viewOrder: any = null;

  viewItems: any[] = [];

  viewHistory: any[] = [];

  viewLoading = false;

  //========================================
  // Edit Status Modal
  //========================================

  showEditModal = false;

  editOrder: any = null;

  editNewStatus = '';

  editRemarks = '';

  editSaving = false;

  //========================================
  // Mark Payment Received Modal (COD)
  //========================================

  showPaymentModal = false;

  paymentTarget: any = null;

  paymentSaving = false;

  //========================================
  // Init
  //========================================

  ngOnInit(): void {

    this.loadOrders();

  }

  //========================================
  // Logged-in Admin (Code / Name)
  //========================================

  private getLoggedInAdminCode(): string {

    try {

      return (localStorage.getItem('UserCode') || '').trim();

    } catch {

      return '';

    }

  }

  private getLoggedInAdminName(): string {

    try {

      const empName = (localStorage.getItem('EmpName') || '').trim();

      if (empName) {
        return empName;
      }

      return (localStorage.getItem('UserName') || '').trim();

    } catch {

      return '';

    }

  }

  get currentAdminLabel(): string {

    const name = this.getLoggedInAdminName() || 'Unknown';
    const code = this.getLoggedInAdminCode();

    return code ? `${name} (${code})` : name;

  }

  //========================================
  // Date Parsing Helper
  //========================================

  private parseApiDate(raw: any): Date | null {

    if (!raw) { return null; }

    if (raw instanceof Date) {
      return isNaN(raw.getTime()) ? null : raw;
    }

    const str = String(raw).trim();

    const dmy = str.match(/^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (dmy) {
      const [, day, month, year, hour, minute, second] = dmy;
      const parsed = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        second ? parseInt(second, 10) : 0
      );
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const native = new Date(str);
    if (!isNaN(native.getTime())) {
      return native;
    }

    const match = str.match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (match) {
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

    return null;
  }

  //========================================
  // Load Orders
  //========================================

  loadOrders(): void {

    this.loading = true;

    this.commonService.GetAllOrders().subscribe({

      next: (response: any) => {

        this.loading = false;

        const rawList = response.status ? (response.data || []) : [];

        this.orderList = rawList.map((x: any) => ({
          ...x,
          Created_On_Date: this.parseApiDate(x.Created_On)
        }));

        this.page = 1;

        this.updateDisplayedData();

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.orderList = [];

        this.updateDisplayedData();

      }

    });

  }

  //========================================
  // Search
  //========================================

  onSearch(): void {

    this.page = 1;

    this.updateDisplayedData();

  }

  clearSearch(): void {

    this.searchText = '';

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Refresh
  //========================================

  refresh(): void {

    this.searchText = '';

    this.statusFilter = 'ALL';

    this.page = 1;

    this.loadOrders();

  }

  //========================================
  // Records Change
  //========================================

  onRecordsChange(size: number): void {

    this.pageSize = Number(size);

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Status Filter Change
  //========================================

  onStatusFilterChange(): void {

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Update Grid
  //========================================

  updateDisplayedData(): void {

    let data = [...this.orderList];

    if (this.statusFilter !== 'ALL') {

      data = data.filter(x => x.Order_Status === this.statusFilter);

    }

    if (this.searchText.trim() !== '') {

      const value = this.searchText.trim().toLowerCase();

      data = data.filter((x: any) =>
        this.getSearchableText(x).includes(value)
      );

    }

    this.totalRecords = data.length;

    const start = (this.page - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.searchList = data.slice(start, end);

  }

  private getSearchableText(value: any): string {

    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).toLowerCase();
      } catch {
        return '';
      }
    }

    return String(value).toLowerCase();

  }

  //========================================
  // Pagination Helpers
  //========================================

  get totalPages(): number {

    return Math.ceil(this.totalRecords / this.pageSize) || 1;

  }

  get startRecord(): number {

    if (this.totalRecords === 0) {

      return 0;

    }

    return ((this.page - 1) * this.pageSize) + 1;

  }

  get endRecord(): number {

    return Math.min(this.page * this.pageSize, this.totalRecords);

  }

  getPageNumbers(): number[] {

    return Array.from({ length: this.totalPages }, (_, i) => i + 1);

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) {

      return;

    }

    this.page = page;

    this.updateDisplayedData();

  }

  //========================================
  // Status Pill Class
  //========================================

  statusClass(status: string): string {

    switch (status) {

      case 'Order Placed': return 'st-placed';

      case 'Packed': return 'st-packed';

      case 'Shipped': return 'st-shipped';

      case 'Out For Delivery': return 'st-outfordelivery';

      case 'Delivered': return 'st-delivered';

      case 'Cancelled': return 'st-cancelled';

      case 'Returned': return 'st-returned';

      default: return '';

    }

  }

  //========================================
  // Status Icon
  //========================================

  statusIcon(status: string): string {

    switch (status) {

      case 'Order Placed': return 'ri-file-list-3-line';

      case 'Packed': return 'ri-archive-2-line';

      case 'Shipped': return 'ri-truck-line';

      case 'Out For Delivery': return 'ri-e-bike-2-line';

      case 'Delivered': return 'ri-checkbox-circle-fill';

      case 'Cancelled': return 'ri-close-circle-fill';

      case 'Returned': return 'ri-arrow-go-back-fill';

      default: return 'ri-checkbox-blank-circle-fill';

    }

  }

  //========================================
  // Payment Status Helpers
  //========================================

  canMarkPayment(order: any): boolean {

    return order?.Payment_Method === 'COD'
      && order?.Order_Status === 'Delivered'
      && order?.Payment_Status !== 'PAID';

  }

  paymentStatusClass(status: string): string {

    return status === 'PAID' ? 'st-delivered' : 'st-packed';

  }

  //========================================
  // Item helpers (product cards in View modal)
  //========================================

  itemImage(item: any): string {

    return item?.Product_Image || item?.ProdImgUrl || '';

  }

  filledStars(rating: number): number[] {

    const value = Math.round(Number(rating) || 0);

    const clamped = Math.min(Math.max(value, 0), 5);

    return Array(clamped).fill(0);

  }

  emptyStars(rating: number): number[] {

    const value = Math.round(Number(rating) || 0);

    const clamped = Math.min(Math.max(value, 0), 5);

    return Array(5 - clamped).fill(0);

  }

  //========================================
  // View Order
  //========================================

  openView(order: any): void {

    this.showViewModal = true;

    this.viewOrder = {
      ...order,
      Created_On: this.parseApiDate(order.Created_On),
      Updated_On: this.parseApiDate(order.Updated_On)
    };

    this.viewItems = [];
    this.viewHistory = [];
    this.viewLoading = true;

    this.commonService.OrderTracking(order.Order_Code).subscribe({

      next: (response: any) => {

        this.viewLoading = false;

        if (response && response.status) {

          const data = response.data || {};

          const apiOrder = (data.order && data.order[0]) || order;

          this.viewOrder = {
            ...apiOrder,
            Created_On: this.parseApiDate(apiOrder.Created_On),
            Updated_On: this.parseApiDate(apiOrder.Updated_On)
          };

          this.viewItems = data.items || [];

          this.viewHistory = (data.history || []).map((h: any) => ({
            ...h,
            Changed_On: this.parseApiDate(h.Changed_On)
          }));

        }

      },

      error: (err) => {

        console.log(err);

        this.viewLoading = false;

      }

    });

  }

  closeView(): void {

    this.showViewModal = false;

    this.viewOrder = null;

    this.viewItems = [];

    this.viewHistory = [];

  }

  //========================================
  // Edit Status
  //========================================

  openEdit(order: any): void {

    this.showEditModal = false;

    this.editOrder = order;
    this.editNewStatus = order?.Order_Status || '';
    this.editRemarks = '';
    this.editSaving = false;

    this.showEditModal = true;

  }

  closeEdit(): void {

    this.showEditModal = false;

    this.editOrder = null;

    this.editNewStatus = '';

    this.editRemarks = '';

  }

  saveStatus(): void {

    if (!this.editOrder || !this.editNewStatus) {

      return;

    }

    const adminCode = this.getLoggedInAdminCode();
    const adminName = this.getLoggedInAdminName();

    if (!adminCode) {

      alert('Session expired. Please login again.');

      return;

    }

    this.editSaving = true;

    const body = {

      OrderCode: this.editOrder.Order_Code,

      NewStatus: this.editNewStatus,

      ChangedBy: adminCode,

      ChangedByName: adminName,

      Remarks: this.editRemarks

    };

    this.commonService.UpdateOrderStatus(body).subscribe({

      next: (response: any) => {

        this.editSaving = false;

        if (response.status) {

          this.closeEdit();

          this.loadOrders();

        }

      },

      error: (err) => {

        console.log(err);

        this.editSaving = false;

      }

    });

  }

  //========================================
  // Mark Payment Received (COD)
  //========================================

  openPayment(order: any): void {

    this.paymentTarget = order;

    this.paymentSaving = false;

    this.showPaymentModal = true;

  }

  closePayment(): void {

    this.showPaymentModal = false;

    this.paymentTarget = null;

  }

  confirmPayment(): void {

    if (!this.paymentTarget) {
      return;
    }

    const adminCode = this.getLoggedInAdminCode();
    const adminName = this.getLoggedInAdminName();

    if (!adminCode) {
      alert('Session expired. Please login again.');
      return;
    }

    this.paymentSaving = true;

    const body = {
      OrderCode: this.paymentTarget.Order_Code,
      ReceivedBy: adminCode,
      ReceivedByName: adminName
    };

    this.commonService.MarkPaymentReceived(body).subscribe({

      next: (response: any) => {

        this.paymentSaving = false;

        if (response?.status) {

          this.closePayment();

          this.loadOrders();

        } else {

          alert(response?.message || 'Payment mark panna mudiyala.');

        }

      },

      error: (err) => {

        console.log(err);

        this.paymentSaving = false;

        alert(err?.error?.message || 'Payment mark panna mudiyala.');

      }

    });

  }

  //========================================
  // Export / Print (stubs)
  //========================================

  exportExcel(): void {

    console.log('Export Excel');

  }

  exportPdf(): void {

    console.log('Export PDF');

  }

  printList(): void {

    window.print();

  }

}