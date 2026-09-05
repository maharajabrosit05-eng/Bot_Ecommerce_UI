import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { Breadcrumb, BreadcrumbItem } from '../../breadcrumb/breadcrumb';
import { AlertService } from '../../../services/alert.service';
import { CommonService } from '../../../../../services/common.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-update-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    Breadcrumb
  ],
  templateUrl: './update-products.html',
  styleUrl: './update-products.scss'
})
export class UpdateProducts implements OnInit, OnChanges, AfterViewInit {

  // ---------- Panel mode inputs/outputs ----------
  @Input() isPanelMode = false;
  @Input() productCode = '';
  @Output() updated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private hasLoadedOnce = false;

  @ViewChild('firstField') firstField!: ElementRef;

  @ViewChild('categorySelect')
  categorySelect!: NgSelectComponent;

  // ==========================================================
  // FIX: ng-select dropdown "floating / disconnected on scroll" bug
  // ------------------------------------------------------------
  // Reason: appendTo="body" panna, ng-select dropdown ku
  // position:fixed kudukkum. Offcanvas/panel-ku CSS `transform`
  // (slide-in animation ku) irundha, andha transform oru puthu
  // "containing block" create pannidum -- adhanaal dropdown-oda
  // fixed positioning viewport-ku badhila andha transformed
  // container-ku relative ah maari, scroll pannumbodhu disconnect
  // aagi floating ah kaanudhu.
  //
  // Fix: appendTo="body" ku badhila, ACTUAL scrollable container
  // (offcanvas-body / panel wrapper) kulla dropdown-ah append
  // pannurom. Idhu vaccha dropdown same scrolling context kulla
  // than irukkum, so scroll pannumbodhu browser automatic ah
  // adha correct ah track pannum -- JS hack edhuvum theva illa.
  // ==========================================================

  dropdownAppendTo = 'body'; // fallback default

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private hostRef: ElementRef<HTMLElement>
  ) {
    this.productForm = this.fb.group({

      CategoryId: [null, Validators.required],
      BrandId: [null, Validators.required],
      TaxId: [null, Validators.required],

      ProductName: ['', Validators.required],

      ProductCode: [{ value: '', disabled: true }],
      SKU: [{ value: '', disabled: true }],
      Barcode: [''],

      ShortDescription: ['', Validators.maxLength(500)],
      Description: [''],
      Specifications: [''],

      PurchasePrice: [null, [Validators.required, Validators.min(0)]],
      SellingPrice: [null, [Validators.required, Validators.min(0)]],
      MRP: [null, [Validators.required, Validators.min(0)]],

      CurrentStock: [0, [Validators.required, Validators.min(0)]],
      MinimumStock: [0, [Validators.required, Validators.min(0)]],
      MaximumStock: [0, [Validators.required, Validators.min(0)]],

      SubCategory: [null],
      HSNCode: [null],
      WarrantyMonths: [null],
      ProductUOM: [null],
      ModelNo: [''],
      ReorderLevel: [null],
      Color: [null],

      StarRating: [null, [Validators.min(1), Validators.max(5)]],

    });
  }

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', icon: 'ri-home-4-line' }
  ];

  submitted = false;
  saving = false;
  loading = true;

  loggedInUser = '';

  productForm: FormGroup;

  categoryOptions: any[] = [];
  brandOptions: any[] = [];
  subCategoryOptions: any[] = [];
  taxOptions: any[] = [];
  hsnOptions: any[] = [];
  warrantyOptions: any[] = [];
  colorOptions: any[] = [];
  reorderLevelOptions: any[] = [];
  umoOptions: any[] = [];

  // ============================================================
  // PRODUCT IMAGE (S3)
  // ============================================================

  // Image already saved on the product (S3 URL) — shown as the
  // current preview until the user picks a new file.
  existingProductImage: string | null = null;

  // Newly picked file's base64 preview — only this gets sent to
  // UpdateProduct, and only when the user actually changes the image.
  productImageFile: File | null = null;
  productImagePreview: string | ArrayBuffer | null = null;

  onProductImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files[0]) {
      return;
    }

    this.productImageFile = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.productImagePreview = reader.result;
    };

    reader.readAsDataURL(this.productImageFile);
  }

  removeProductImage(): void {
    this.productImageFile = null;
    this.productImagePreview = null;
  }

  // ============================================================
  // BRANCH CODE RESOLVER
  // ------------------------------------------------------------
  // Different modules/components have historically stored the
  // logged-in branch under different localStorage keys
  // ('Branch', 'BranchCode', 'Branch_Code'). If the key used at
  // login doesn't match 'Branch', Branch_Code was silently going
  // to the API as an empty string. This checks all known key
  // variants so the save always carries the real branch code.
  // ============================================================

  private getBranchCode(): string {

    const possibleKeys = [
      'Branch',
      'BranchCode',
      'Branch_Code'
    ];

    for (const key of possibleKeys) {

      const value = localStorage.getItem(key);

      if (value && value.trim() !== '') {

        return value.trim();

      }

    }

    console.warn(
      'Branch code not found in localStorage under any known key (Branch / BranchCode / Branch_Code). Product/Stock will be saved with an empty Branch_Code.'
    );

    return '';

  }

  ngOnInit(): void {
    this.loggedInUser = localStorage.getItem('UserName') || '';

    if (!this.isPanelMode) {
      this.productCode = this.route.snapshot.paramMap.get('id') || '';
      this.initLoad();
    } else if (this.productCode) {
      this.initLoad();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.isPanelMode &&
      changes['productCode'] &&
      this.productCode &&
      !this.hasLoadedOnce
    ) {
      this.initLoad();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.firstField?.nativeElement.focus();
    }, 100);

    // FIX: correct scroll container-ah kandupudichu appendTo set pannurom
    this.resolveDropdownAppendTarget();
  }

  /**
   * FIX: dropdown scroll-disconnect bug.
   *
   * Component-oda host element-la irundhu DOM tree mela poyi,
   * yeதாவathு scrollable ancestor (overflow auto/scroll vacha,
   * scrollHeight > clientHeight) kandupudikkurom. Andha element ku
   * oru marker class add pannitu, ng-select-oda `appendTo` ah
   * andha class-ku maathirom -- "body" ku badhila.
   *
   * Idhu vaccha dropdown andha SAME scrolling context kulla
   * render aagum, so scroll pannumbodhu naturally correct ah
   * move aagum (browser automatic ah handle pannum), transform/
   * fixed-position mismatch bug varadhu.
   *
   * Scrollable container onnum kedaikalana, safe fallback ah
   * 'body' than continue aagum (full page mode ku sufficient).
   */
  private resolveDropdownAppendTarget(): void {
    let el: HTMLElement | null = this.hostRef.nativeElement;

    while (el && el !== document.body) {

      const style = window.getComputedStyle(el);

      const isScrollable =
        /(auto|scroll)/.test(style.overflowY) ||
        /(auto|scroll)/.test(style.overflow);

      const canActuallyScroll = el.scrollHeight > el.clientHeight;

      if (isScrollable && canActuallyScroll) {

        const markerClass = 'ng-select-scroll-host';

        if (!el.classList.contains(markerClass)) {
          el.classList.add(markerClass);
        }

        this.dropdownAppendTo = '.' + markerClass;
        return; // first matching ancestor mattum podhum
      }

      el = el.parentElement;
    }

    // Common Bootstrap/NgBootstrap offcanvas fallback
    const fallback = document.querySelector('.offcanvas-body') as HTMLElement | null;

    if (fallback) {
      fallback.classList.add('ng-select-scroll-host');
      this.dropdownAppendTo = '.ng-select-scroll-host';
    }
    // illana 'body' default ah continue aagum
  }

  get f() {
    return this.productForm.controls;
  }

  private pick(obj: any, keys: string[]): any {
    if (!obj) { return null; }
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') {
        return v;
      }
    }
    return null;
  }

  private pickStr(obj: any, keys: string[]): string | null {
    const v = this.pick(obj, keys);
    return v != null ? String(v) : null;
  }

  private initLoad(): void {
    if (!this.productCode) {
      this.alert.error('Product not found.');
      if (this.isPanelMode) {
        this.cancelled.emit();
      } else {
        this.router.navigate(['/all-products']);
      }
      return;
    }

    this.hasLoadedOnce = true;
    this.loadDropdowns();
    this.loadProduct();
  }

  loadDropdowns(): void {

    this.commonService.GetAllCategories().subscribe({
      next: (res: any) => {
        this.categoryOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Category_Code', 'CategoryCode', 'Category_Id', 'CategoryId']),
          name: this.pick(x, ['Category_Name', 'CategoryName'])
        }));
      },
      error: () => { this.categoryOptions = []; }
    });

    this.commonService.GetAllBrands().subscribe({
      next: (res: any) => {
        this.brandOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Brand_Code', 'BrandCode', 'Brand_Id', 'BrandId']),
          name: this.pick(x, ['Brand_Name', 'BrandName'])
        }));
      },
      error: () => { this.brandOptions = []; }
    });

    this.commonService.GetAllGroups().subscribe({
      next: (res: any) => {
        this.subCategoryOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Group_Code', 'GroupCode', 'Group_Id', 'GroupId']),
          name: this.pick(x, ['Group_Name', 'GroupName'])
        }));
      },
      error: () => { this.subCategoryOptions = []; }
    });

    this.commonService.GetAllHsn().subscribe({
      next: (res: any) => {
        this.hsnOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Hsn_Code', 'HsnCode', 'HSNCode']),
          name: this.pick(x, ['Hsn', 'Hsn_Name', 'HsnName'])
        }));
      },
      error: () => { this.hsnOptions = []; }
    });

    this.commonService.GetAllTaxList().subscribe({
      next: (res: any) => {
        this.taxOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Tax_Percentage', 'TaxPercentage', 'Gst_Per', 'GstPer']),
          name: this.pick(x, ['Tax_Name', 'TaxName'])
        }));
      },
      error: () => { this.taxOptions = []; }
    });

    this.commonService.GetAllWarrantyList().subscribe({
      next: (res: any) => {
        this.warrantyOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Warranty_Months', 'WarrantyMonths', 'Warranty_Period', 'WarrantyPeriod']),
          name: this.pick(x, ['Warranty_Name', 'WarrantyName'])
        }));
      },
      error: () => { this.warrantyOptions = []; }
    });

    this.commonService.GetAllColorList().subscribe({
      next: (res: any) => {
        this.colorOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Color_Code', 'ColorCode', 'Color_Id', 'ColorId']),
          name: this.pick(x, ['Color_Name', 'ColorName'])
        }));
      },
      error: () => { this.colorOptions = []; }
    });

    this.commonService.GetAllReorderLevelList().subscribe({
      next: (res: any) => {
        this.reorderLevelOptions = (res.data || []).map((x: any) => {
          const level = this.pick(x, ['Reorder_Level', 'ReorderLevel']);
          const desc = this.pick(x, ['Description', 'Desc']);
          return {
            id: level != null ? String(level) : null,
            name: (desc || '') + ' (' + level + ')'
          };
        });
      },
      error: () => { this.reorderLevelOptions = []; }
    });

    this.commonService.GetAllUomList().subscribe({
      next: (res: any) => {
        this.umoOptions = (res.data || []).map((x: any) => ({
          id: this.pickStr(x, ['Uom_Code', 'UomCode', 'Uom_Id', 'UomId']),
          name: this.pick(x, ['Uom_Name', 'UomName'])
        }));
      },
      error: () => { this.umoOptions = []; }
    });
  }

  loadProduct(): void {
    this.loading = true;

    this.commonService.GetProductById(this.productCode).subscribe({
      next: (res: any) => {
        if (res?.status === false || !res?.data) {
          this.loading = false;
          this.alert.error(res?.message || 'Product not found.');
          if (this.isPanelMode) {
            this.cancelled.emit();
          } else {
            this.router.navigate(['/all-products']);
          }
          return;
        }

        const raw = res.data;
        const p = Array.isArray(raw) ? raw[0] : raw;

        if (!p) {
          this.loading = false;
          this.alert.error('Product data format sariyilla. Console-la log paarunga.');
          return;
        }

        this.productForm.patchValue({
          CategoryId: this.pickStr(p, ['Category_Code', 'CategoryCode', 'Category_Id', 'CategoryId']),
          BrandId: this.pickStr(p, ['Brand_Code', 'BrandCode', 'Brand_Id', 'BrandId']),
          TaxId: this.pickStr(p, ['Gst_Per', 'GstPer', 'Tax_Percentage', 'TaxPercentage', 'TaxId']),

          ProductName: this.pick(p, ['Product_Name', 'ProductName']) || '',
          ProductCode: this.pick(p, ['Product_Code', 'ProductCode']) || '',
          SKU: this.pick(p, ['SKU', 'Sku']) || '',
          Barcode: this.pick(p, ['Barcode']) || '',

          ShortDescription: this.pick(p, ['Product_Short_Name', 'ProductShortName', 'Short_Description', 'ShortDescription']) || '',
          Description: this.pick(p, ['Description', 'Spec_Details', 'SpecDetails']) || '',
          Specifications: this.pick(p, ['Specifications']) || '',

          PurchasePrice: this.pick(p, ['Cost_Price', 'CostPrice', 'Purchase_Price', 'PurchasePrice']) ?? null,
          SellingPrice: this.pick(p, ['Selling_Price', 'SellingPrice']) ?? null,
          MRP: this.pick(p, ['Mrp_Price', 'MrpPrice', 'MRP']) ?? null,

          CurrentStock: this.pick(p, ['CurrentStock', 'Current_Stock']) ?? 0,
          MinimumStock: this.pick(p, ['Minimum_Stock', 'MinimumStock']) ?? 0,
          MaximumStock: this.pick(p, ['Maximum_Stock', 'MaximumStock']) ?? 0,

          SubCategory: this.pickStr(p, ['Group_Code', 'GroupCode', 'SubCategory', 'Sub_Category']),
          HSNCode: this.pickStr(p, ['Hsn_Code', 'HsnCode', 'HSNCode']),
          WarrantyMonths: this.pickStr(p, ['Warranty_Period', 'WarrantyPeriod', 'Warranty_Months', 'WarrantyMonths']),
          ProductUOM: this.pickStr(p, ['Uom_Code', 'UomCode', 'ProductUOM', 'Product_UOM']),
          ModelNo: this.pick(p, ['Model_No', 'ModelNo']) || '',
          ReorderLevel: this.pickStr(p, ['Reorder_Level', 'ReorderLevel']),
          Color: this.pickStr(p, ['Color_Code', 'ColorCode', 'Color']),

          StarRating: this.pick(p, ['Star_Rating', 'StarRating']) ?? null
        });

        // Show the image already saved on S3 for this product (if any).
        this.existingProductImage = this.pick(p, ['Product_Image', 'ProdImgUrl']) || null;
        this.productImageFile = null;
        this.productImagePreview = null;

        this.loading = false;
        setTimeout(() => {
          this.categorySelect?.focus();
        }, 200);

        // FIX: loading spinner remove aagi form varum bodhu DOM structure
        // change aagudhu, so andha appuram than correct scrollable
        // container kedaikkum -- appendTo target-ah refresh pannurom.
        setTimeout(() => {
          this.resolveDropdownAppendTarget();
        }, 300);

        this.commonService.GetProductStock(this.productCode).subscribe({
          next: (stockRes: any) => {
            const stockList = stockRes?.data || [];
            const branchCode = this.getBranchCode();
            const match = stockList.find((s: any) => s.Location_Code === branchCode) || stockList[0];
            if (match) {
              this.productForm.patchValue({ CurrentStock: match.Stock_Qty });
            }
          },
          error: () => { /* CurrentStock column value already la irundhuchu, ok */ }
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('GetProductById failed:', err);
        this.alert.error('Product load aaga mudiyala, try again.');
        if (this.isPanelMode) {
          this.cancelled.emit();
        } else {
          this.router.navigate(['/all-products']);
        }
      }
    });
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.alert.warning('Ellam field um sariya fill pannunga');
      return;
    }

    this.saving = true;

    const f = this.productForm.getRawValue();

    const branchCode = this.getBranchCode();

    const payload = {
      Product_Code: this.productCode,
      Product_Name: f.ProductName,
      Product_Short_Name: (f.ShortDescription || '').trim(),
      Barcode: f.Barcode || '',
      Category_Code: f.CategoryId,
      Group_Code: f.SubCategory,
      Brand_Code: f.BrandId,
      Uom_Code: f.ProductUOM,
      Hsn_Code: f.HSNCode,
      Description: f.Description,
      Cost_Price: f.PurchasePrice,
      Mrp_Price: f.MRP,
      Selling_Price: f.SellingPrice,
      Gst_Per: f.TaxId,
      Gst_Type: 'Exclusive',
      Warranty_Period: f.WarrantyMonths,
      Spec_Details: f.Description,
      Inventory_Type: 'Inventory',
      Online_Display_Name: f.ProductName,
      Updated_By: this.loggedInUser,
      Product_Type: 'Finished Goods',
      Model_No: f.ModelNo,
      Color_Code: f.Color,
      Reorder_Level: f.ReorderLevel,
      Star_Rating: f.StarRating,
      Specifications: f.Specifications,
      CurrentStock: f.CurrentStock,
      MinimumStock: f.MinimumStock,
      MaximumStock: f.MaximumStock,

      // Only send the image when the user picked a NEW file — a base64
      // string here tells the backend to upload it to S3 and replace the
      // URL. If left empty, the backend keeps the existing S3 image as-is.
      ...(this.productImagePreview
        ? { Product_Image: this.productImagePreview as string }
        : {})
    };

    this.commonService.UpdateProduct(payload).subscribe({
      next: (res: any) => {

        if (res?.status === false) {
          this.saving = false;
          this.alert.error(res.message || 'Product update aaga mudiyala, try again.');
          return;
        }

        this.commonService.SaveStock({
          Product_Code: this.productCode,
          Location_Code: branchCode || 'MAIN',
          Stock_Qty: f.CurrentStock,
          Updated_By: this.loggedInUser,
          Created_By: this.loggedInUser,
          Branch_Code: branchCode
        }).subscribe({
          next: () => { this.saving = false; },
          error: () => { this.saving = false; }
        });

        this.alert.success(res?.message || 'Product updated successfully!');

        if (this.isPanelMode) {
          this.updated.emit(res?.data || true);
        }
      },
      error: () => {
        this.saving = false;
        this.alert.error('Product update aaga mudiyala, try again.');
      }
    });
  }

  onCancel(): void {
    if (this.isPanelMode) {
      this.cancelled.emit();
    } else {
      this.router.navigate(['/all-products']);
    }
  }

}