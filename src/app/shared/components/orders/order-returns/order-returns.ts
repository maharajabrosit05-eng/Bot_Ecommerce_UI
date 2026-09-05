// order-returns.ts
//
// NOTE (Maharaja ku): idhu SP_M_ReturnedOrderList proc oda exact column
// names theriyama, All Orders / Cancel Orders pattern follow panni
// common-sense field names vachi eluthirukom:
//   Return_Code, Order_Code, Customer_Code, Customer_Name,
//   Product_Name, Return_Qty, Return_Reason,
//   Refund_Code, Refund_Amount, Refund_Status ('PENDING' | 'PROCESSED'),
//   Returned_By, Returned_By_Name, Returned_On
// Unga actual proc output field names verah irundha, indha .html file la
// {{r.FieldName}} bindings mattum maathinaal podhum, logic edhuvum
// maara vendiyathu illa.

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-order-returns',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './order-returns.html',
  styleUrls: ['./order-returns.scss']
})
export class OrderReturns implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  //========================================
  // Variables
  //========================================

  returnList: any[] = [];

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
  // Refund Status Options
  //========================================

  refundStatusOptions = [
    { id: 'ALL', name: 'All Refund Status' },
    { id: 'PENDING', name: 'Pending' },
    { id: 'PROCESSED', name: 'Processed' }
  ];

  //========================================
  // View Modal (order-level items/returns/refunds)
  //========================================

  showViewModal = false;

  viewReturn: any = null;

  viewItems: any[] = [];

  viewReturns: any[] = [];

  viewRefunds: any[] = [];

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

    this.loadReturns();

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
  // Date Parsing Helper (same pattern as All Orders)
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
  // Load Returns
  //========================================

  loadReturns(): void {

    this.loading = true;

    this.commonService.GetReturnedOrderList().subscribe({

      next: (response: any) => {

        this.loading = false;

        const rawList = response.status ? (response.data || []) : [];

        this.returnList = rawList.map((x: any) => ({
          ...x,
          Returned_On_Date: this.parseApiDate(x.Returned_On)
        }));

        this.page = 1;

        this.updateDisplayedData();

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.returnList = [];

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

    this.refundStatusFilter = 'ALL';

    this.page = 1;

    this.loadReturns();

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

    let data = [...this.returnList];

    if (this.refundStatusFilter !== 'ALL') {

      data = data.filter(x => x.Refund_Status === this.refundStatusFilter);

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

    switch (status) {

      case 'PROCESSED': return 'st-delivered';

      case 'PENDING': return 'st-packed';

      case 'NOT_APPLICABLE': return 'st-cancelled';

      default: return '';

    }

  }

  refundStatusLabel(status: string): string {

    switch (status) {

      case 'PROCESSED': return 'Processed';

      case 'PENDING': return 'Pending';

      case 'NOT_APPLICABLE': return 'Not Applicable';

      default: return status || '—';

    }

  }

  //========================================
  // Item helpers (product cards in View modal)
  //========================================

  itemImage(item: any): string {

    return item?.Product_Image || item?.ProdImgUrl || '';

  }

  //========================================
  // View Return Detail
  //========================================

  openView(row: any): void {

    this.showViewModal = true;

    this.viewReturn = {
      ...row,
      Returned_On: this.parseApiDate(row.Returned_On)
    };

    this.viewItems = [];
    this.viewReturns = [];
    this.viewRefunds = [];
    this.viewLoading = true;

    this.commonService.OrderCancelReturnDetails(row.Order_Code).subscribe({

      next: (response: any) => {

        this.viewLoading = false;

        if (response && response.status) {

          const data = response.data || {};

          this.viewItems = data.items || data.Items || [];

          this.viewReturns = (data.returns || data.Returns || []).map((r: any) => ({
            ...r,
            Returned_On: this.parseApiDate(r.Returned_On)
          }));

          this.viewRefunds = (data.refunds || data.Refunds || []).map((r: any) => ({
            ...r,
            Requested_On: this.parseApiDate(r.Requested_On)
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

    this.viewReturn = null;

    this.viewItems = [];

    this.viewReturns = [];

    this.viewRefunds = [];

  }

  //========================================
  // Process Refund
  //========================================

  canProcessRefund(row: any): boolean {

    return row?.Refund_Status === 'PENDING' && !!row?.Refund_Code;

  }

  openRefund(row: any): void {

    this.refundTarget = row;

    this.refundTxnRef = '';

    this.refundSaving = false;

    this.showRefundModal = true;

  }

  closeRefund(): void {

    this.showRefundModal = false;

    this.refundTarget = null;

    this.refundTxnRef = '';

  }

  confirmRefund(): void {

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

          this.loadReturns();

        } else {

          alert(response?.message || 'Refund process panna mudiyala.');

        }

      },

      error: (err) => {

        console.log(err);

        this.refundSaving = false;

        alert(err?.error?.message || 'Refund process panna mudiyala.');

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