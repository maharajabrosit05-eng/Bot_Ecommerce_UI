import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-contact-form-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './contact-form-details.html',
  styleUrls: ['./contact-form-details.scss']
})
export class ContactFormDetails implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  //========================================
  // Variables
  //========================================

  enquiryList: any[] = [];

  filteredList: any[] = [];

  searchList: any[] = [];

  loading = false;

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  searchText = '';

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
  // Init
  //========================================

  ngOnInit(): void {
    this.loadEnquiries();
  }

  //========================================
  // Load Enquiries
  //========================================

  loadEnquiries(): void {

    this.loading = true;

    this.commonService.GetContactEnquiryList().subscribe({

      next: (response: any) => {

        this.loading = false;

        this.enquiryList = response.status ? (response.data || []) : [];

        this.page = 1;

        this.updateDisplayedData();

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.enquiryList = [];

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

  //========================================
  // Clear Search
  //========================================

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

    this.page = 1;

    this.loadEnquiries();

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

    let data = [...this.enquiryList];

    if (this.searchText.trim() !== '') {

      const value = this.searchText.toLowerCase();

      data = data.filter((x: any) =>

        (x.Full_Name || '').toLowerCase().includes(value) ||

        (x.Email_Id || '').toLowerCase().includes(value) ||

        (x.Mobile_No || '').toLowerCase().includes(value) ||

        (x.Subject || '').toLowerCase().includes(value) ||

        (x.Message || '').toLowerCase().includes(value) ||

        (x.Customer_Code || '').toLowerCase().includes(value)

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
  // Start / End Record
  //========================================

  get startRecord(): number {

    if (this.totalRecords === 0) { return 0; }

    return ((this.page - 1) * this.pageSize) + 1;

  }

  get endRecord(): number {

    return Math.min(this.page * this.pageSize, this.totalRecords);

  }

  //========================================
  // Page Numbers
  //========================================

  getPageNumbers(): number[] {

    return Array.from({ length: this.totalPages }, (_, i) => i + 1);

  }

  //========================================
  // Go To Page
  //========================================

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) { return; }

    this.page = page;

    this.updateDisplayedData();

  }

  //========================================
  // Export
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