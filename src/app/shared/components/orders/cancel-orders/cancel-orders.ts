import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-cancel-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './cancel-orders.html',
  styleUrls: ['./cancel-orders.scss']
})
export class CancelOrders implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  //========================================
  // Variables
  //========================================

  cancelList: any[] = [];

  searchList: any[] = [];

  loading = false;

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  searchText = '';

  refundStatusFilter = 'ALL';

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
  // Refund Status Filter Options
  //========================================

  refundStatusOptions = [
    { id: 'ALL', name: 'All Refund Status' },
    { id: 'PENDING', name: 'Pending' },
    { id: 'PROCESSED', name: 'Processed' },
    { id: 'NOT_APPLICABLE', name: 'Not Applicable (COD)' }
  ];

  //========================================
  // View Modal (Cancellation / Return / Refund / Items details)
  //========================================

  showViewModal = false;

  viewOrder: any = null;

  viewCancellation: any = null;

  viewReturns: any[] = [];

  viewRefunds: any[] = [];

  viewItems: any[] = [];

  viewLoading = false;

  //========================================
  // Process Refund Modal
  //========================================

  showRefundModal = false;

  refundTarget: any = null;

  refundTxnRef = '';

  refundSaving = false;

  //========================================
  // Init
  //========================================

  ngOnInit(): void {

    this.loadCancelledOrders();

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

    return null;
  }

  //========================================
  // Load Cancelled Orders
  //========================================

  loadCancelledOrders(): void {

    this.loading = true;

    this.commonService.GetCancelledOrderList().subscribe({

      next: (response: any) => {

        this.loading = false;

        const rawList = response?.status ? (response.data || []) : [];

        this.cancelList = rawList.map((x: any) => ({
          ...x,
          Cancelled_On_Date: this.parseApiDate(x.Cancelled_On)
        }));

        this.page = 1;

        this.updateDisplayedData();

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.cancelList = [];

        this.updateDisplayedData();

      }

    });

  }

  refresh(): void {

    this.searchText = '';

    this.refundStatusFilter = 'ALL';

    this.page = 1;

    this.loadCancelledOrders();

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
  // Records Change
  //========================================

  onRecordsChange(size: number): void {

    this.pageSize = Number(size);

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Refund Status Filter Change
  //========================================

  onRefundStatusFilterChange(): void {

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Update Grid
  //========================================

  updateDisplayedData(): void {

    let data = [...this.cancelList];

    if (this.refundStatusFilter !== 'ALL') {

      data = data.filter(x => (x.Refund_Status || 'PENDING') === this.refundStatusFilter);

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
  // Refund Status Pill Class
  //========================================

  refundStatusClass(status: string): string {

    switch ((status || 'PENDING').toUpperCase()) {

      case 'PROCESSED': return 'st-delivered';

      case 'PENDING': return 'st-packed';

      case 'NOT_APPLICABLE': return 'st-placed';

      default: return 'st-placed';

    }

  }

  //========================================
  // Item helpers (product cards in View modal) — All Orders reference
  //========================================

  itemImage(item: any): string {

    return item?.Product_Image || item?.ProdImgUrl || '';

  }

  //========================================
  // View Cancellation / Return / Refund / Items Details
  //========================================

  openView(order: any): void {

    this.showViewModal = true;

    this.viewOrder = {
      ...order,
      Cancelled_On: this.parseApiDate(order.Cancelled_On)
    };

    this.viewCancellation = null;
    this.viewReturns = [];
    this.viewRefunds = [];
    this.viewItems = [];
    this.viewLoading = true;

    this.commonService.OrderCancelReturnDetails(order.Order_Code).subscribe({

      next: (response: any) => {

        this.viewLoading = false;

        if (response && response.status) {

          const data = response.data || {};

          const cancellationList = data.Cancellation || data.cancellation || [];
          const returnsList = data.Returns || data.returns || [];
          const refundsList = data.Refunds || data.refunds || [];
          const itemsList = data.Items || data.items || [];

          this.viewCancellation = (cancellationList && cancellationList[0]) || null;

          this.viewReturns = returnsList;

          this.viewRefunds = (refundsList || []).map((r: any) => ({
            ...r,
            Requested_On_Date: this.parseApiDate(r.Requested_On)
          }));

          this.viewItems = itemsList;

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

    this.viewCancellation = null;

    this.viewReturns = [];

    this.viewRefunds = [];

    this.viewItems = [];

  }

  //========================================
  // Process Refund
  //========================================

  openRefund(refund: any): void {

    this.refundTarget = refund;
    this.refundTxnRef = '';
    this.refundSaving = false;

    this.showRefundModal = true;

  }

  closeRefund(): void {

    this.showRefundModal = false;

    this.refundTarget = null;

    this.refundTxnRef = '';

  }

  saveRefund(): void {

    if (!this.refundTarget || !this.refundTxnRef.trim()) {

      return;

    }

    this.refundSaving = true;

    const body = {
      RefundCode: this.refundTarget.Refund_Code,
      RefundTxnRef: this.refundTxnRef.trim()
    };

    this.commonService.ProcessRefund(body).subscribe({

      next: (response: any) => {

        this.refundSaving = false;

        if (response?.status) {

          this.closeRefund();

          if (this.viewOrder) {
            this.openView(this.viewOrder);
          }

          this.loadCancelledOrders();

        }

      },

      error: (err) => {

        console.log(err);

        this.refundSaving = false;

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