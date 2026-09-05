import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { Breadcrumb, BreadcrumbItem } from '../../breadcrumb/breadcrumb';
import { AlertService } from '../../../services/alert.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { CommonService } from '../../../../../services/common.service';

import { AddProduct } from '../add-product/add-product';
import { UpdateProducts } from '../update-products/update-products';


@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    FlatpickrModule,
    Breadcrumb,
    NgbTooltipModule,
    AddProduct,
    UpdateProducts
  ],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss',
})
export class AllProducts implements OnInit {

  productList: any[] = [];
  filterForm: FormGroup;
  filteredData: any[] = [];
  searchList: any[] = [];
  categoryOptions: any[] = [];
  brandOptions: any[] = [];
  supplierOptions: any[] = [];
  umoOptions: any[] = [];
  taxOptions: any[] = [];
  colorOptions: any[] = [];

  searchTerm = '';
  page = 1;
  pageSize = 10;
  totalRecords = 0;

  // ---------- Right side slide panel state (Add / Edit) ----------
  showPanel = false;
  panelMode: 'add' | 'edit' | null = null;
  selectedProductCode = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: 'ri-home-4-line' },
    { label: 'Products' },
    { label: 'All Products' }
  ];

  recordsOptions = [
    { id: 10, name: '10 Records' },
    { id: 25, name: '25 Records' },
    { id: 50, name: '50 Records' },
    { id: 100, name: '100 Records' }
  ];

  private readonly defaultFilters = {
    fromDate: null,
    toDate: null,
    category: 'all',
    brand: 'all',
    unit: 'all',
    gst: 'all',
    color: 'all',
    supplier: 'all'
  };

  exportColumns: ExportColumn[] = [
    { header: 'Product', field: 'Product_Name' },
    { header: 'Product Code', field: 'Product_Code' },
    { header: 'SKU', field: 'SKU' },
    { header: 'Category', field: 'Product_Category' },
    { header: 'Brand', field: 'Brand_Name' },
    { header: 'Unit', field: 'Product_UOM' },
    { header: 'GST', field: 'GST_Name' },
    { header: 'Selling Price (₹)', field: 'Selling_Price' },
    { header: 'Stock', field: 'CurrentStock' },
    { header: 'Status', field: 'Is_Active' }
  ];

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private alert: AlertService,
    private exportSvc: ExportService,
    private router: Router,
  ) {
    this.filterForm = this.fb.group({
      fromDate: [null],
      toDate: [null],
      category: ['all'],
      brand: ['all'],
      unit: ['all'],
      gst: ['all'],
      color: ['all'],
      supplier: ['all']
    });
  }

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];

    this.filterForm.patchValue({
      ...this.defaultFilters,
      fromDate: today,
      toDate: today
    });

    this.GetAll();
  }

  // ==================== Side Panel Controls ====================

  openAddPanel(): void {
    this.panelMode = 'add';
    this.selectedProductCode = '';
    this.showPanel = true;
  }

  openEditPanel(productCode: string): void {
    this.panelMode = 'edit';
    this.selectedProductCode = productCode;
    this.showPanel = true;
  }

  closePanel(): void {
    this.showPanel = false;
    this.panelMode = null;
    this.selectedProductCode = '';
  }

  // Add/Update panel-la irundhu save success aana, ithu call aagum --
  // panel close pannitu, list-ah fresh ah reload pannirom.
  onPanelSaved(): void {
    this.closePanel();
    this.GetAll();
  }

  // ==================== Existing methods ====================

  onCategoryChange() {
    this.page = 1;
    this.updateDisplayedData();
  }

  onRecordsChange(size: number) {
    this.pageSize = Number(size);
    this.page = 1;
    this.updateDisplayedData();
  }

  onSearch() {
    this.page = 1;
    this.updateDisplayedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  clearFilter(): void {
    this.filterForm.reset({
      ...this.defaultFilters
    });

    this.searchTerm = '';
    this.page = 1;

    this.updateDisplayedData();
  }

  GetAll() {
    this.commonService.GetAllProducts().subscribe({
      next: (res: any) => {
        const rawList = res.data || [];

        this.productList = rawList.map((x: any) => ({
          ...x,
          ProductId: x.ProductId || x.Product_Code,
          SKU: x.SKU,
          Barcode: x.Barcode,
          Product_Category: x.Category_Name,
          Brand_Name: x.Brand_Name,
          Product_UOM: x.Uom_Name,
          GST_Name: x.Gst + '%',
          Purchase_Price: x.Cost_Price,
          Selling_Price: x.Selling_Price,
          MRP: x.Mrp_Price,
          Minimum_Stock: x.Minimum_Stock,
          Maximum_Stock: x.Maximum_Stock,
          Warranty_Name: x.Warranty_Name,
          Color_Name: x.Color_Name,
          Is_Active: (x.Is_Active === 'A' || x.Is_Active === 'Y') ? 'A' : 'D'
        }));
        this.loadDropdowns();
        this.updateDisplayedData();
        this.loadStockCounts();
      },
      error: () => {
        this.productList = [];
        this.updateDisplayedData();
      }
    });
  }

  loadStockCounts() {
    this.commonService.GetProductStock().subscribe({
      next: (res: any) => {
        const stockList = res?.data || [];
        this.productList.forEach(p => {
          const match = stockList.find((s: any) => s.Product_Code === p.Product_Code);
          if (match) {
            p.CurrentStock = match.Stock_Qty;
          }
        });
        this.updateDisplayedData();
      },
      error: () => { /* stock API fail aana, ItemList-la irundha CurrentStock value athuve nikkum */ }
    });
  }

  loadDropdowns() {
    this.categoryOptions = [
      { id: 'all', name: 'All' },
      ...this.productList
        .map(x => ({ id: x.Category_Name, name: x.Category_Name }))
        .filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)
    ];

    this.brandOptions = [
      { id: 'all', name: 'All' },
      ...this.productList
        .map(x => ({ id: x.Brand_Name, name: x.Brand_Name }))
        .filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)
    ];

    this.umoOptions = [
      { id: 'all', name: 'All' },
      ...this.productList
        .map(x => ({ id: x.Product_UOM, name: x.Product_UOM }))
        .filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)
    ];

    this.taxOptions = [
      { id: 'all', name: 'All' },
      ...this.productList
        .map(x => ({ id: x.Gst_Per, name: x.Gst_Per }))
        .filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)
    ];

    this.colorOptions = [
      { id: 'all', name: 'All' },
      ...this.productList
        .map(x => ({ id: x.Color_Name, name: x.Color_Name }))
        .filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)
    ];

    this.supplierOptions = [{ id: 'all', name: 'All' }];
  }

  viewProducts() {
    this.page = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    let data = [...this.productList];

    const category = this.filterForm.value.category;
    const brand = this.filterForm.value.brand;
    const unit = this.filterForm.value.unit;
    const gst = this.filterForm.value.gst;
    const color = this.filterForm.value.color;
    const supplier = this.filterForm.value.supplier;

    if (category != 'all') {
      data = data.filter(x => x.Category_Name == category);
    }

    if (brand != 'all') {
      data = data.filter(x => x.Brand_Name == brand);
    }

    if (unit != 'all') {
      data = data.filter(x => x.Product_UOM == unit);
    }

    if (gst != 'all') {
      data = data.filter(x => x.GST_Name == gst);
    }

    if (color != 'all') {
      data = data.filter(x => x.Color_Name == color);
    }

    void supplier;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(item =>
        Object.values(item).some(value =>
          value != null &&
          value.toString().toLowerCase().includes(term)
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

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.page = page;
    this.updateDisplayedData();
  }

  // FIX: idhu than HTML-la (click)="editProduct(p.Product_Code)" call panra
  // method -- munnadi ithu "openEditPanel" nu rename aagi, HTML-oda match
  // aagama "editProduct is not a function" error throw pannuchu. Ippo
  // HTML-ku match aagura peru-oda vachu, panel open panna delegate pannirom.
  editProduct(productCode: string): void {
    this.openEditPanel(productCode);
  }

  // FIX: idhuvum munnadi file-la accidentally miss aagiruchu -- delete
  // button "is not a function" error throw pannama irukka, mudhal mari
  // thirumba sethirukom.
  async deleteProduct(product: any): Promise<void> {
    const confirmed = await this.alert.confirmDelete(
      'Delete this product?',
      `"${product.Product_Name}" delete pannava?`
    );

    if (!confirmed) {
      return;
    }

    this.commonService.DeleteProduct(product.Product_Code).subscribe({
      next: (res: any) => {
        if (res?.status === false) {
          this.alert.error(res.message || 'Product delete aaga mudiyala.');
          return;
        }

        this.productList = this.productList.filter(
          x => x.Product_Code !== product.Product_Code
        );

        this.updateDisplayedData();
        this.alert.toast('Product deleted');
      },
      error: () => {
        this.alert.error('Product delete aaga mudiyala, try again.');
      }
    });
  }

  // FIX: export/print buttons um idhe maadhiri "is not a function" throw
  // pannama irukka thirumba sethirukom.
  exportExcel(): void {
    this.exportSvc.exportExcel(this.filteredData.length ? this.filteredData : this.productList, 'All Products');
  }

  exportPdf(): void {
    const data = this.filteredData.length ? this.filteredData : this.productList;
    this.exportSvc.exportPdf(this.exportColumns, data, 'All Products', 'All Products Report');
  }

  printList(): void {
    const data = this.filteredData.length ? this.filteredData : this.productList;
    this.exportSvc.printData('All Products', this.exportColumns, data);
  }

  // ---------- Default image path (public/assets folder la vachikonga) ----------
  defaultProductImage = 'assets/images/no-image.png';

  getProductImageSrc(imageData: string | null | undefined): string {
    if (imageData && imageData.trim() !== '') {
      if (imageData.startsWith('data:image')) {
        return imageData;
      }
      return `data:image/png;base64,${imageData}`;
    }
    return this.defaultProductImage;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.defaultProductImage;
  }

}