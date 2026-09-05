import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-all-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './all-customers.html',
  styleUrls: ['./all-customers.scss']
})
export class AllCustomers implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  //========================================
  // Variables
  //========================================

  customerList: any[] = [];

  filteredList: any[] = [];

  searchList: any[] = [];

  loading = false;

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  searchText = '';

  statusFilter = 'ALL';

  activeCount = 0;

  inactiveCount = 0;

  //========================================
  // Records Dropdown
  //========================================

  recordsOptions = [

    {
      id: 10,
      name: '10 Records'
    },

    {
      id: 25,
      name: '25 Records'
    },

    {
      id: 50,
      name: '50 Records'
    },

    {
      id: 100,
      name: '100 Records'
    }

  ];

  //========================================
  // Init
  //========================================

  ngOnInit(): void {

    this.loadCustomers();

  }

  //========================================
  // Load Customers
  //========================================

  loadCustomers(): void {

    this.loading = true;



    this.commonService.GetCustomerList().subscribe({

      next: (response: any) => {

        this.loading = false;

        if (response.status) {

          this.customerList = response.data || [];

        } else {

          this.customerList = [];

        }

        this.page = 1;

        this.updateDisplayedData();

        this.customerList = response.data || [];

        this.activeCount = this.customerList.filter(x => x.Is_Active == 'A').length;

        this.inactiveCount = this.customerList.filter(x => x.Is_Active != 'A').length;

        this.page = 1;

        this.updateDisplayedData();

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.customerList = [];

        this.updateDisplayedData();

      }

    });

  }

  //========================================
  // View
  //========================================

  viewCustomers(): void {

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Search
  //========================================

  onSearch(): void {

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Clear Search
  //========================================

  clearSearch(): void {

    this.searchText = '';

    this.page = 1;

    this.updateDisplayedData();

  }

  //========================================
  // Clear Filter
  //========================================

  clearFilter(): void {

    this.searchText = '';

    this.statusFilter = 'ALL';

    this.page = 1;

    this.pageSize = 10;

    this.updateDisplayedData();

  }

  //========================================
  // Refresh
  //========================================

  refresh(): void {

    this.searchText = '';

    this.statusFilter = 'ALL';

    this.page = 1;

    this.loadCustomers();

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
  // Update Grid
  //========================================

  updateDisplayedData(): void {

    let data = [...this.customerList];

    //=========================
    // Status Filter
    //=========================

    if (this.statusFilter === 'A') {

      data = data.filter(x => x.Is_Active === 'A');

    }

    else if (this.statusFilter === 'D') {

      data = data.filter(x => x.Is_Active !== 'A');

    }

    //=========================
    // Search
    //=========================

    if (this.searchText.trim() !== '') {

      const value = this.searchText.toLowerCase();

      data = data.filter((x: any) =>

        (x.Customer_Code || '').toLowerCase().includes(value) ||

        (x.Customer_Name || '').toLowerCase().includes(value) ||

        (x.Mobile_No || '').toLowerCase().includes(value) ||

        (x.Email_Id || '').toLowerCase().includes(value) ||

        (x.GSTIN_Number || '').toLowerCase().includes(value) ||

        (x.Billing_City || '').toLowerCase().includes(value) ||

        (x.Billing_State || '').toLowerCase().includes(value) ||

        (x.Company_Code || '').toLowerCase().includes(value) ||

        (x.Branch_Code || '').toLowerCase().includes(value)

      );

    }

    this.filteredList = data;

    this.totalRecords = data.length;

    const start = (this.page - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.searchList = data.slice(start, end);

  }
  //========================================
  // Total Pages
  //========================================

  get totalPages(): number {

    return Math.ceil(this.totalRecords / this.pageSize) || 1;

  }

  //========================================
  // Start Record
  //========================================

  get startRecord(): number {

    if (this.totalRecords === 0) {

      return 0;

    }

    return ((this.page - 1) * this.pageSize) + 1;

  }

  //========================================
  // End Record
  //========================================

  get endRecord(): number {

    return Math.min(

      this.page * this.pageSize,

      this.totalRecords

    );

  }

  //========================================
  // Page Numbers
  //========================================

  getPageNumbers(): number[] {

    return Array.from(

      {

        length: this.totalPages

      },

      (_, i) => i + 1

    );

  }

  //========================================
  // Go To Page
  //========================================

  goToPage(page: number): void {

    if (

      page < 1 ||

      page > this.totalPages

    ) {

      return;

    }

    this.page = page;

    this.updateDisplayedData();

  }

  //========================================
  // Export Excel
  //========================================

  exportExcel(): void {

    console.log('Export Excel');

  }

  //========================================
  // Export PDF
  //========================================

  exportPdf(): void {

    console.log('Export PDF');

  }

  //========================================
  // Print
  //========================================

  printList(): void {

    window.print();

  }

  changeStatus(status: string): void {

    this.statusFilter = status;

    this.page = 1;

    this.updateDisplayedData();

  }

}