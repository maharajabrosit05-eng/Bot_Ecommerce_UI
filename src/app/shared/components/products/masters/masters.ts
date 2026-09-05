import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { Observable } from 'rxjs';

import { Breadcrumb, BreadcrumbItem } from '../../breadcrumb/breadcrumb';
import { AlertService } from '../../../services/alert.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { CommonService } from '../../../../../services/common.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

//=========================================================
// Field / Tab config types
//=========================================================

interface MasterField {
  key: string;                                  // form control name
  label: string;                                 // shown in modal
  type: 'text' | 'number' | 'select';
  required?: boolean;
  optionsKey?: 'categoryOptions';                // where to pull ng-select options from (for select type)
}

interface MasterTab {
  key: string;                                   // 'category' | 'group' | 'brand' | 'uom' | 'hsn'
  label: string;                                 // button / heading label
  icon: string;                                  // remixicon class
  codeField: string;                             // e.g. Category_Code
  nameField: string;                             // e.g. Category_Name (used for search + table)
  nameLabel: string;                              // e.g. 'Category Name'
  columns: { header: string; field: string }[];  // table columns (besides S.No / Status / Actions)
  fields: MasterField[];                          // extra form fields besides name + status
  getAll: () => Observable<any>;
  save: (body: any) => Observable<any>;
  update: (body: any) => Observable<any>;
  remove: (code: string) => Observable<any>;
}

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    Breadcrumb,
    NgbTooltipModule
  ],
  templateUrl: './masters.html',
  styleUrl: './masters.scss'
})
export class Masters implements OnInit {

  //=========================================================
  // Name input ref — Add/Edit modal open aagumbodhu focus
  // kudukurathukku (html la already #nameInput iruku)
  //=========================================================

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  //=========================================================
  // Breadcrumb
  //=========================================================

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: 'ri-home-4-line' },
    { label: 'Products' },
    { label: 'Masters' }
  ];

  //=========================================================
  // Dropdowns (shared)
  //=========================================================

  /** DB convention: Is_Active eppovum 'A' (Active) / 'D' (Inactive) than irukanum */
  statusOptions = [
    { id: 'A', name: 'Active' },
    { id: 'D', name: 'Inactive' }
  ];

  categoryOptions: any[] = [];   // used as parent-category dropdown for Group tab

  //=========================================================
  // Tabs config — ALL master screens live here
  //=========================================================

  tabs: MasterTab[] = [];

  activeTab!: MasterTab;

  //=========================================================
  // Lists
  //=========================================================

  fullList: any[] = [];        // full API data for active tab
  filteredList: any[] = [];    // table (after search + paging)

  //=========================================================
  // Search / Paging
  //=========================================================

  searchTerm = '';
  page = 1;
  pageSize = 10;
  totalRecords = 0;

  //=========================================================
  // Modal
  //=========================================================

  showModal = false;
  isEditMode = false;
  masterForm!: FormGroup;
  editingCode: string | null = null;

  //=========================================================
  // Export
  //=========================================================

  exportColumns: ExportColumn[] = [];

  //=========================================================
  // Constructor
  //=========================================================

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private exportSvc: ExportService,
    private commonService: CommonService
  ) {
    this.buildTabs();
  }

  //=========================================================
  // On Init
  //=========================================================

  ngOnInit(): void {
    // Category list is needed everywhere (Group tab's parent dropdown),
    // so load it once up front, then load whichever tab is active.
    this.loadCategoryOptions();
    this.selectTab(this.tabs[0]);
  }

  get f() {
    return this.masterForm.controls;
  }

  //=========================================================
  // Build tab configuration (Category / Group / Brand / UOM / HSN)
  //=========================================================

  private buildTabs(): void {

    this.tabs = [
      {
        key: 'category',
        label: 'Category',
        icon: 'ri-price-tag-3-line',
        codeField: 'Category_Code',
        nameField: 'Category_Name',
        nameLabel: 'Category Name',
        columns: [
          { header: 'Category Name', field: 'Category_Name' },
          { header: 'Short Name', field: 'Short_Name' },
          { header: 'Display Order', field: 'Display_Order' }
        ],
        fields: [
          { key: 'Short_Name', label: 'Short Name', type: 'text' },
          { key: 'Display_Order', label: 'Display Order', type: 'number' }
        ],
        getAll: () => this.commonService.GetAllCategories(),
        save: (body: any) => this.commonService.SaveCategory(body),
        update: (body: any) => this.commonService.UpdateCategory(body),
        remove: (code: string) => this.commonService.DeleteCategory(code)
      },
      // {
      //   key: 'group',
      //   label: 'Sub Category',
      //   icon: 'ri-price-tag-2-line',
      //   codeField: 'Group_Code',
      //   nameField: 'Group_Name',
      //   nameLabel: 'Group Name',
      //   columns: [
      //     { header: 'Category', field: 'Category_Code' },
      //     { header: 'Group Name', field: 'Group_Name' },
      //     { header: 'Short Name', field: 'Short_Name' },
      //     { header: 'Display Order', field: 'Display_Order' }
      //   ],
      //   fields: [
      //     { key: 'Category_Code', label: 'Parent Category', type: 'select', required: true, optionsKey: 'categoryOptions' },
      //     { key: 'Short_Name', label: 'Short Name', type: 'text' },
      //     { key: 'Display_Order', label: 'Display Order', type: 'number' }
      //   ],
      //   getAll: () => this.commonService.GetAllGroups(),
      //   save: (body: any) => this.commonService.SaveGroup(body),
      //   update: (body: any) => this.commonService.UpdateGroup(body),
      //   remove: (code: string) => this.commonService.DeleteGroup(code)
      // },
      {
        key: 'brand',
        label: 'Brand',
        icon: 'ri-award-line',
        codeField: 'Brand_Code',
        nameField: 'Brand_Name',
        nameLabel: 'Brand Name',
        columns: [
          { header: 'Brand Name', field: 'Brand_Name' },
          { header: 'Short Name', field: 'Short_Name' }
        ],
        fields: [
          { key: 'Short_Name', label: 'Short Name', type: 'text' }
        ],
        getAll: () => this.commonService.GetAllBrands(),
        save: (body: any) => this.commonService.SaveBrand(body),
        update: (body: any) => this.commonService.UpdateBrand(body),
        remove: (code: string) => this.commonService.DeleteBrand(code)
      },
      {
        key: 'uom',
        label: 'UOM',
        icon: 'ri-ruler-2-line',
        codeField: 'Uom_Code',
        nameField: 'Uom_Name',
        nameLabel: 'UOM Name',
        columns: [
          { header: 'UOM Name', field: 'Uom_Name' }
        ],
        fields: [],
        getAll: () => this.commonService.GetAllUnits(),
        save: (body: any) => this.commonService.SaveUom(body),
        update: (body: any) => this.commonService.UpdateUom(body),
        remove: (code: string) => this.commonService.DeleteUom(code)
      },
      {
        key: 'hsn',
        label: 'HSN',
        icon: 'ri-percent-line',
        codeField: 'Hsn_Code',
        nameField: 'Hsn',
        nameLabel: 'HSN',
        columns: [
          { header: 'HSN', field: 'Hsn' },
          // { header: 'GST %', field: 'Gst' }
        ],
        fields: [
          // { key: 'Gst', label: 'GST %', type: 'number', required: true }
        ],
        getAll: () => this.commonService.GetAllHsn(),
        save: (body: any) => this.commonService.SaveHsn(body),
        update: (body: any) => this.commonService.UpdateHsn(body),
        remove: (code: string) => this.commonService.DeleteHsn(code)
      },

      // {
      //   key: 'gst',
      //   label: 'GST',
      //   icon: 'ri-percent-line',

      //   codeField: 'Gst_Code',
      //   nameField: 'Gst',
      //   nameLabel: 'GST',

      //   columns: [
      //     { header: 'GST %', field: 'Gst' }
      //   ],

      //   fields: [],

      //   getAll: () => this.commonService.GetAllGst(),
      //   save: (body) => this.commonService.SaveGst(body),
      //   update: (body) => this.commonService.UpdateGst(body),
      //   remove: (code) => this.commonService.DeleteGst(code)
      // }
    ];
  }

  //=========================================================
  // Category dropdown (used by Group tab's parent select)
  //=========================================================

  loadCategoryOptions(): void {
    this.commonService.GetAllCategories().subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        this.categoryOptions = list.map((x: any) => ({
          id: x.Category_Code,
          name: x.Category_Name
        }));
      },
      error: () => {
        this.categoryOptions = [];
      }
    });
  }

  //=========================================================
  // Tab switch — "Category click panna category open, HSN click
  // panna HSN open" — ithu than andha logic
  //=========================================================

  selectTab(tab: MasterTab): void {

    this.activeTab = tab;

    this.searchTerm = '';
    this.page = 1;
    this.fullList = [];
    this.filteredList = [];
    this.totalRecords = 0;

    this.exportColumns = [
      { header: tab.nameLabel, field: tab.nameField },
      ...tab.columns.filter(c => c.field !== tab.nameField),
      { header: 'Status', field: 'Is_Active' }
    ];

    this.GetAll();
  }

  //=========================================================
  // Get List (for whichever tab is active)
  //=========================================================

  GetAll(): void {

    this.activeTab.getAll().subscribe({
      next: (res: any) => {
        this.fullList = res?.data || [];
        this.applyFilter();
      },
      error: () => {
        this.fullList = [];
        this.filteredList = [];
        this.totalRecords = 0;
      }
    });
  }

  //=========================================================
  // Pagination
  //=========================================================

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(pageNo: number): void {
    if (pageNo < 1 || pageNo > this.totalPages) {
      return;
    }
    this.page = pageNo;
    this.applyFilter();
  }

  //=========================================================
  // Search
  //=========================================================

  onSearch(): void {
    this.page = 1;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.applyFilter();
  }

  //=========================================================
  // Filter
  //=========================================================

  applyFilter(): void {

    let list = [...this.fullList];

    if (this.searchTerm.trim() !== '') {

      const txt = this.searchTerm.toLowerCase();
      const nameField = this.activeTab.nameField;
      const codeField = this.activeTab.codeField;

      list = list.filter((x: any) =>
        (x[nameField] || '').toString().toLowerCase().includes(txt) ||
        (x[codeField] || '').toString().toLowerCase().includes(txt)
      );
    }

    this.totalRecords = list.length;

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.filteredList = list.slice(start, end);
  }

  //=========================================================
  // Build dynamic form for the active tab
  //=========================================================

  private buildForm(): void {

    const group: any = {
      name: ['', Validators.required],
      status: ['A', Validators.required]
    };

    for (const field of this.activeTab.fields) {
      group[field.key] = [
        '',
        field.required ? Validators.required : []
      ];
    }

    this.masterForm = this.fb.group(group);
  }

  //=========================================================
  // Modal open aana pinnadi Name field ku focus kudukurathukku.
  // *ngIf modal render aaganum first, apparam dhaan ViewChild
  // ready aagum — so setTimeout(0) use pannirukom.
  //=========================================================

  private focusNameInput(): void {
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    });
  }

  //=========================================================
  // Add
  //=========================================================

  openAddModal(): void {

    this.isEditMode = false;
    this.editingCode = null;

    this.buildForm();
    this.masterForm.patchValue({ name: '', status: 'A' });

    this.showModal = true;

    this.focusNameInput();
  }

  //=========================================================
  // Edit
  //=========================================================

  openEditModal(row: any): void {

    this.isEditMode = true;
    this.editingCode = row[this.activeTab.codeField];

    this.buildForm();

    const patch: any = {
      name: row[this.activeTab.nameField],
      // legacy rows innum 'Y'/'N' ah irundhalum, 'A'/'D' ah normalize pannurom
      status: (row.Is_Active === 'A' || row.Is_Active === 'Y') ? 'A' : 'D'
    };

    for (const field of this.activeTab.fields) {
      patch[field.key] = row[field.key];
    }

    this.masterForm.patchValue(patch);

    this.showModal = true;

    this.focusNameInput();
  }

  //=========================================================
  // Close Modal
  //=========================================================

  closeModal(): void {
    this.showModal = false;
    this.editingCode = null;
  }

  //=========================================================
  // Toggle Status (ON/OFF) — flips the status control between
  // 'A' (Active) and 'D' (Inactive). Backend receives
  // Is_Active = 'A'/'D' — same convention everywhere in the app.
  //=========================================================

  toggleStatus(): void {
    const current = this.masterForm.get('status')?.value;
    this.masterForm.patchValue({ status: current === 'A' ? 'D' : 'A' });
  }

  //=========================================================
  // Login info — Company_Code / Branch_Code / User Id.
  // auth.service.ts oda login() method, login success aana odane
  // ivvalavu keys ah localStorage la direct ah (JSON object ah
  // illama) save pannudhu: 'UserCode', 'BranchCode', 'RoleCode',
  // 'EmpName'. add-product.ts oda getBranchCode() um idhae
  // 'BranchCode' key thaan check pannudhu — so masters um adhae
  // convention follow pannanum. Company_Code ku login response
  // edhuvum anupala (API la andha field kidayathu), so
  // add-product.ts la use panra 'C00001' default ah idhu vachu
  // match pannirukken.
  //=========================================================

  private getLoginInfo(): { companyCode: string; branchCode: string; userId: string } {

    return {
      companyCode: localStorage.getItem('CompanyCode') || 'C00001',
      branchCode: localStorage.getItem('BranchCode') || localStorage.getItem('Branch') || '',
      userId: localStorage.getItem('UserCode') || localStorage.getItem('UserName') || '1'
    };
  }

  //=========================================================
  // Save / Update (Add Product mari — proper ah body build panni,
  // active tab-oda save/update endpoint ku anupurom)
  //=========================================================

  saveMaster(): void {

    if (this.masterForm.invalid) {
      this.masterForm.markAllAsTouched();
      this.alert.warning('Please fill all required fields.');
      return;
    }

    const form = this.masterForm.value;
    const tab = this.activeTab;
    const login = this.getLoginInfo();

    const body: any = {
      [tab.nameField]: (form.name || '').trim(),
      Is_Active: form.status,
      Created_By: login.userId,
      Updated_By: login.userId,
      Company_Code: login.companyCode,
      Branch_Code: login.branchCode
    };

    for (const field of tab.fields) {
      body[field.key] = form[field.key];
    }

    //---------------------------------------------------
    // UPDATE
    //---------------------------------------------------

    if (this.isEditMode) {

      body[tab.codeField] = this.editingCode;

      tab.update(body).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.alert.success(`${tab.label} Updated Successfully.`);
            this.closeModal();
            this.GetAll();
            if (tab.key === 'category') {
              this.loadCategoryOptions();
            }
          } else {
            this.alert.error(res.message);
          }
        },
        error: () => {
          this.alert.error(`Unable to update ${tab.label}.`);
        }
      });

      return;
    }

    //---------------------------------------------------
    // SAVE
    //---------------------------------------------------

    tab.save(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.alert.success(`${tab.label} Saved Successfully.`);
          this.closeModal();
          this.GetAll();
          if (tab.key === 'category') {
            this.loadCategoryOptions();
          }
        } else {
          this.alert.error(res.message);
        }
      },
      error: () => {
        this.alert.error(`Unable to save ${tab.label}.`);
      }
    });
  }

  //=========================================================
  // Delete (SOFT delete only — backend sets Is_Active = 'D')
  //=========================================================

  async deleteMaster(row: any): Promise<void> {

    const tab = this.activeTab;

    const ok = await this.alert.confirmDelete(
      `Delete ${tab.label}?`,
      row[tab.nameField]
    );

    if (!ok) return;

    tab.remove(row[tab.codeField]).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.alert.success(`${tab.label} Deleted Successfully.`);
          this.GetAll();
          if (tab.key === 'category') {
            this.loadCategoryOptions();
          }
        } else {
          this.alert.error(res.message);
        }
      },
      error: () => {
        this.alert.error(`Unable to delete ${tab.label}.`);
      }
    });
  }

  //=========================================================
  // Export Excel
  //=========================================================

  exportExcel(): void {
    this.exportSvc.exportExcel(
      this.fullList,
      `${this.activeTab.label}_List`
    );
  }

  //=========================================================
  // Export PDF
  //=========================================================

  exportPdf(): void {
    this.exportSvc.exportPdf(
      this.exportColumns,
      this.fullList,
      `${this.activeTab.label}_List`,
      `${this.activeTab.label} Master`
    );
  }

  //=========================================================
  // Print
  //=========================================================

  printList(): void {
    this.exportSvc.printData(
      `${this.activeTab.label} Master`,
      this.exportColumns,
      this.fullList
    );
  }

  //=========================================================
  // Helper for template: resolve select options by key
  //=========================================================

  getFieldOptions(field: MasterField): any[] {
    if (field.optionsKey === 'categoryOptions') {
      return this.categoryOptions;
    }
    return [];
  }

  //=========================================================
  // Helper for template: category name lookup (Group table shows
  // Category_Code — this maps it back to a readable name)
  //=========================================================

  getCategoryName(code: string): string {
    const match = this.categoryOptions.find(c => c.id === code);
    return match ? match.name : code;
  }


  get startRecord(): number {
    return this.totalRecords === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.page * this.pageSize, this.totalRecords);
  }

}