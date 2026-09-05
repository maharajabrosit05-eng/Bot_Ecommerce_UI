import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  NgSelectModule,
  NgSelectComponent
} from '@ng-select/ng-select';

import {
  Breadcrumb,
  BreadcrumbItem
} from '../../breadcrumb/breadcrumb';

import { AlertService } from '../../../services/alert.service';

import { CommonService } from '../../../../../services/common.service';

import { RouterModule } from '@angular/router';



@Component({

  selector: 'app-add-product',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    Breadcrumb,
    RouterModule
  ],

  templateUrl: './add-product.html',

  styleUrl: './add-product.scss'

})
export class AddProduct
  implements OnInit, AfterViewInit {


  // ============================================================
  // PANEL MODE
  // ============================================================

  @Input()
  isPanelMode = false;


  @Output()
  saved = new EventEmitter<any>();


  @Output()
  cancelled = new EventEmitter<void>();



  // ============================================================
  // BREADCRUMB
  // ============================================================

  breadcrumbs: BreadcrumbItem[] = [

    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: 'ri-home-4-line'
    },

    {
      label: 'Products'
    },

    {
      label: 'Add Product'
    }

  ];



  // ============================================================
  // FIRST DROPDOWN
  // ============================================================

  @ViewChild('firstField')
  firstField!: NgSelectComponent;



  // ============================================================
  // FORM
  // ============================================================

  productForm: FormGroup;

  submitted = false;

  saving = false;



  // ============================================================
  // USER
  // ============================================================

  loggedInUser = '';



  // ============================================================
  // DROPDOWN OPTIONS
  // ============================================================

  categoryOptions: any[] = [];

  brandOptions: any[] = [];

  subCategoryOptions: any[] = [];

  taxOptions: any[] = [];

  hsnOptions: any[] = [];

  warrantyOptions: any[] = [];

  colorOptions: any[] = [];

  reorderLevelOptions: any[] = [];

  umoOptions: any[] = [];

  supplierOptions: any[] = [];

  unitOptions: any[] = [];



  // ============================================================
  // IMAGE
  // ============================================================

  productImageFile: File | null = null;

  productImagePreview:
    string |
    ArrayBuffer |
    null = null;


  thumbnailImageFile: File | null = null;

  thumbnailImagePreview:
    string |
    ArrayBuffer |
    null = null;



  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(

    private fb: FormBuilder,

    private commonService: CommonService,

    private alert: AlertService

  ) {


    // ==========================================================
    // PRODUCT FORM
    // ==========================================================

    this.productForm = this.fb.group({

      CategoryId: [
        null,
        Validators.required
      ],

      BrandId: [
        null,
        Validators.required
      ],

      SupplierId: [
        null
      ],

      UnitId: [
        null
      ],

      TaxId: [
        null,
        Validators.required
      ],

      ProductName: [
        '',
        Validators.required
      ],

      ProductCode: [
        {
          value: '',
          disabled: true
        }
      ],

      SKU: [
        {
          value: '',
          disabled: true
        }
      ],

      Barcode: [
        {
          value: '',
          disabled: true
        }
      ],

      PartNo: [
        {
          value: '',
          disabled: true
        }
      ],

      ShortDescription: [
        '',
        Validators.maxLength(500)
      ],

      Description: [
        ''
      ],

      Specifications: [
        ''
      ],

      PurchasePrice: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      SellingPrice: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      MRP: [
        null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      CurrentStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      MinimumStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      MaximumStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      Weight: [
        null,
        Validators.min(0)
      ],

      IsFeatured: [
        false
      ],

      IsBestSeller: [
        false
      ],

      IsNewArrival: [
        false
      ],

      SubCategory: [
        null
      ],

      HSNCode: [
        null
      ],

      WarrantyMonths: [
        null
      ],

      ProductType: [
        'Finished Goods'
      ],

      InventoryType: [
        'Inventory'
      ],

      ProductUOM: [
        null
      ],

      ModelNo: [
        ''
      ],

      ReorderLevel: [
        0
      ],

      Color: [
        null
      ],

      StarRating: [
        null,
        [
          Validators.min(1),
          Validators.max(5)
        ]
      ]

    });

  }



  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.loggedInUser =
      localStorage.getItem('UserName') || '';


    this.loadDropdowns();

  }



  // ============================================================
  // AFTER VIEW INIT
  // ============================================================

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.firstField?.focus();

    }, 300);

  }



  // ============================================================
  // FORM CONTROLS
  // ============================================================

  get f() {

    return this.productForm.controls;

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



  // ============================================================
  // DROPDOWN VALUE NORMALIZER
  // ============================================================

  private mapDropdown(
    data: any[],
    idKeys: string[],
    nameKeys: string[]
  ): any[] {

    if (!Array.isArray(data)) {

      return [];

    }


    return data

      .map((item: any) => {

        let id: any = null;

        let name: any = null;


        // --------------------------------------------------------
        // FIND ID
        // --------------------------------------------------------

        for (const key of idKeys) {

          if (
            item?.[key] !== undefined &&
            item?.[key] !== null
          ) {

            id = item[key];

            break;

          }

        }


        // --------------------------------------------------------
        // FIND NAME
        // --------------------------------------------------------

        for (const key of nameKeys) {

          if (
            item?.[key] !== undefined &&
            item?.[key] !== null
          ) {

            name = item[key];

            break;

          }

        }


        return {

          id: id != null
            ? String(id)
            : '',

          name: name != null
            ? String(name)
            : ''

        };

      })

      .filter(
        x =>
          x.id !== '' &&
          x.name !== ''
      );

  }



  // ============================================================
  // LOAD ALL DROPDOWNS
  // ============================================================

  loadDropdowns(): void {


    // ==========================================================
    // CATEGORY
    // ==========================================================

    this.commonService
      .GetAllCategories()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.categoryOptions =
            this.mapDropdown(

              data,

              [
                'Category_Code',
                'CategoryCode',
                'Code',
                'id'
              ],

              [
                'Category_Name',
                'CategoryName',
                'Name',
                'name'
              ]

            );

          console.log(
            'CATEGORY:',
            this.categoryOptions
          );

        },

        error: (error) => {

          console.error(
            'Category API Error:',
            error
          );

          this.categoryOptions = [];

        }

      });



    // ==========================================================
    // BRAND
    // ==========================================================

    this.commonService
      .GetAllBrands()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.brandOptions =
            this.mapDropdown(

              data,

              [
                'Brand_Code',
                'BrandCode',
                'Code',
                'id'
              ],

              [
                'Brand_Name',
                'BrandName',
                'Name',
                'name'
              ]

            );

          console.log(
            'BRAND:',
            this.brandOptions
          );

        },

        error: (error) => {

          console.error(
            'Brand API Error:',
            error
          );

          this.brandOptions = [];

        }

      });



    // ==========================================================
    // GROUP / SUB CATEGORY
    // ==========================================================

    this.commonService
      .GetAllGroups()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.subCategoryOptions =
            this.mapDropdown(

              data,

              [
                'Group_Code',
                'GroupCode',
                'Code',
                'id'
              ],

              [
                'Group_Name',
                'GroupName',
                'Name',
                'name'
              ]

            );

        },

        error: (error) => {

          console.error(
            'Group API Error:',
            error
          );

          this.subCategoryOptions = [];

        }

      });



    // ==========================================================
    // HSN
    // ==========================================================

    this.commonService
      .GetAllHsn()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.hsnOptions =
            this.mapDropdown(

              data,

              [
                'Hsn_Code',
                'HSN_Code',
                'HsnCode',
                'HSNCode',
                'Code',
                'id'
              ],

              [
                'Hsn',
                'HSN',
                'Hsn_Name',
                'HSN_Name',
                'Name',
                'name'
              ]

            );

          console.log(
            'HSN:',
            this.hsnOptions
          );

        },

        error: (error) => {

          console.error(
            'HSN API Error:',
            error
          );

          this.hsnOptions = [];

        }

      });



    // ==========================================================
    // TAX
    // ==========================================================

    this.commonService
      .GetAllTaxList()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.taxOptions =
            this.mapDropdown(

              data,

              [
                'Tax_Code',
                'TaxCode',
                'Code',
                'id'
              ],

              [
                'Tax_Name',
                'TaxName',
                'Name',
                'name'
              ]

            );

          console.log(
            'TAX:',
            this.taxOptions
          );

        },

        error: (error) => {

          console.error(
            'Tax API Error:',
            error
          );

          this.taxOptions = [];

        }

      });



    // ==========================================================
    // WARRANTY
    // ==========================================================

    this.commonService
      .GetAllWarrantyList()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.warrantyOptions =
            this.mapDropdown(

              data,

              [
                'Warranty_Code',
                'WarrantyCode',
                'Code',
                'id'
              ],

              [
                'Warranty_Name',
                'WarrantyName',
                'Name',
                'name'
              ]

            );

          console.log(
            'WARRANTY:',
            this.warrantyOptions
          );

        },

        error: (error) => {

          console.error(
            'Warranty API Error:',
            error
          );

          this.warrantyOptions = [];

        }

      });



    // ==========================================================
    // COLOR
    // ==========================================================

    this.commonService
      .GetAllColorList()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.colorOptions =
            this.mapDropdown(

              data,

              [
                'Color_Code',
                'ColorCode',
                'Code',
                'id'
              ],

              [
                'Color_Name',
                'ColorName',
                'Name',
                'name'
              ]

            );

          console.log(
            'COLOR:',
            this.colorOptions
          );

        },

        error: (error) => {

          console.error(
            'Color API Error:',
            error
          );

          this.colorOptions = [];

        }

      });



    // ==========================================================
    // REORDER LEVEL
    // ==========================================================

    this.commonService
      .GetAllReorderLevelList()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.reorderLevelOptions =
            this.mapDropdown(

              data,

              [
                'Reorder_Code',
                'ReorderCode',
                'Code',
                'id'
              ],

              [
                'Reorder_Level',
                'ReorderLevel',
                'Name',
                'name'
              ]

            );

        },

        error: (error) => {

          console.error(
            'Reorder API Error:',
            error
          );

          this.reorderLevelOptions = [];

        }

      });



    // ==========================================================
    // UOM
    // ==========================================================

    this.commonService
      .GetAllUomList()
      .subscribe({

        next: (res: any) => {

          const data =
            res?.data || [];

          this.umoOptions =
            this.mapDropdown(

              data,

              [
                'Uom_Code',
                'UOM_Code',
                'UomCode',
                'UOMCode',
                'Code',
                'id'
              ],

              [
                'Uom_Name',
                'UOM_Name',
                'UomName',
                'UOMName',
                'Name',
                'name'
              ]

            );

          console.log(
            'UOM:',
            this.umoOptions
          );

        },

        error: (error) => {

          console.error(
            'UOM API Error:',
            error
          );

          this.umoOptions = [];

        }

      });


    // ==========================================================
    // SUPPLIER / UNIT
    // ==========================================================

    this.supplierOptions = [];

    this.unitOptions = [];

  }



  // ============================================================
  // PRODUCT IMAGE
  // ============================================================

  onProductImageSelect(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      !input.files[0]
    ) {

      return;

    }


    this.productImageFile =
      input.files[0];


    const reader =
      new FileReader();


    reader.onload = () => {

      this.productImagePreview =
        reader.result;

    };


    reader.readAsDataURL(
      this.productImageFile
    );

  }



  // ============================================================
  // REMOVE PRODUCT IMAGE
  // ============================================================

  removeProductImage(): void {

    this.productImageFile = null;

    this.productImagePreview = null;

  }



  // ============================================================
  // THUMBNAIL IMAGE
  // ============================================================

  onThumbnailImageSelect(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      !input.files[0]
    ) {

      return;

    }


    this.thumbnailImageFile =
      input.files[0];


    const reader =
      new FileReader();


    reader.onload = () => {

      this.thumbnailImagePreview =
        reader.result;

    };


    reader.readAsDataURL(
      this.thumbnailImageFile
    );

  }



  // ============================================================
  // REMOVE THUMBNAIL
  // ============================================================

  removeThumbnailImage(): void {

    this.thumbnailImageFile = null;

    this.thumbnailImagePreview = null;

  }



  // ============================================================
  // SUBMIT PRODUCT
  // ============================================================

  onSubmit(): void {

    this.submitted = true;


    if (
      this.productForm.invalid
    ) {

      this.productForm.markAllAsTouched();

      this.alert.warning(
        'Ellam field um sariya fill pannunga'
      );

      return;

    }


    this.saving = true;


    const f =
      this.productForm.getRawValue();


    const branchCode =
      this.getBranchCode();



    // ==========================================================
    // SAVE PAYLOAD
    // ==========================================================

    const payload = {

      Product_Name:
        f.ProductName,

      Product_Short_Name:
        (f.ShortDescription || '').trim(),

      Barcode:
        f.Barcode || '',

      Category_Code:
        f.CategoryId,

      Group_Code:
        f.SubCategory,

      Brand_Code:
        f.BrandId,

      Uom_Code:
        f.ProductUOM,

      Hsn_Code:
        f.HSNCode,

      Description:
        f.Description,

      Cost_Price:
        f.PurchasePrice,

      Mrp_Price:
        f.MRP,

      Selling_Price:
        f.SellingPrice,

      Gst_Per:
        this.getGstPercent(f.TaxId),

      Gst_Type:
        'Exclusive',

      Warranty_Period:
        this.getWarrantyName(f.WarrantyMonths),
      Spec_Details:
        f.Description,

      Inventory_Type:
        f.InventoryType,

      Online_Display_Name:
        f.ProductName,

      Created_By:
        this.loggedInUser,

      Company_Code:
        'C00001',

      Branch_Code:
        branchCode,

      Product_Type:
        f.ProductType,

      Model_No:
        f.ModelNo,

      Color_Code:
        f.Color,

      Reorder_Level:
        f.ReorderLevel,

      Star_Rating:
        f.StarRating,

      Specifications:
        f.Specifications,

      CurrentStock:
        f.CurrentStock,

      MinimumStock:
        f.MinimumStock,

      MaximumStock:
        f.MaximumStock,

      // Base64 image (data:image/..;base64,...) — backend uploads this
      // to S3 automatically and stores the resulting public URL.
      ...(this.productImagePreview
        ? { Product_Image: this.productImagePreview as string }
        : {})

    };



    // ==========================================================
    // SAVE PRODUCT API
    // ==========================================================

    this.commonService
      .SaveProduct(payload)
      .subscribe({

        next: (res: any) => {


          if (
            res?.status === false
          ) {

            this.saving = false;

            this.alert.error(
              res.message ||
              'Product save aaga mudiyala, try again.'
            );

            return;

          }


          const savedProductCode =
            res?.data?.Product_Code || '';



          // ====================================================
          // UPDATE GENERATED PRODUCT CODE
          // ====================================================

          this.productForm.patchValue({

            ProductCode:
              savedProductCode,

            Barcode:
              f.Barcode || ''

          });



          // ====================================================
          // SAVE STOCK
          // ====================================================

          if (
            savedProductCode &&
            f.CurrentStock != null
          ) {

            this.commonService
              .SaveStock({

                Product_Code:
                  savedProductCode,

                Location_Code:
                  branchCode || 'MAIN',

                Stock_Qty:
                  f.CurrentStock,

                Created_By:
                  this.loggedInUser,

                Company_Code:
                  'C00001',

                Branch_Code:
                  branchCode

              })
              .subscribe({

                next: () => {

                  this.saving = false;

                },

                error: () => {

                  this.saving = false;

                }

              });

          } else {

            this.saving = false;

          }



          // ====================================================
          // SUCCESS MESSAGE
          // ====================================================

          this.alert.success(
            res?.message ||
            'Product added successfully!'
          );



          // ====================================================
          // PANEL MODE
          // ====================================================

          if (
            this.isPanelMode
          ) {

            this.saved.emit(
              res?.data || true
            );

          }

        },

        error: (error) => {

          console.error(
            'Save Product Error:',
            error
          );

          this.saving = false;

          this.alert.error(
            'Product save aaga mudiyala, try again.'
          );

        }

      });

  }



  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {

    this.submitted = false;


    this.productForm.reset({

      CategoryId: null,

      BrandId: null,

      SupplierId: null,

      UnitId: null,

      TaxId: null,

      ProductName: '',

      ShortDescription: '',

      Description: '',

      Specifications: '',

      PurchasePrice: null,

      SellingPrice: null,

      MRP: null,

      CurrentStock: 0,

      MinimumStock: 0,

      MaximumStock: 0,

      Weight: null,

      IsFeatured: false,

      IsBestSeller: false,

      IsNewArrival: false,

      SubCategory: null,

      HSNCode: null,

      WarrantyMonths: null,

      ProductType: 'Finished Goods',

      InventoryType: 'Inventory',

      ProductUOM: null,

      ModelNo: '',

      ReorderLevel: 0,

      Color: null,

      StarRating: null

    });


    this.productForm.get(
      'ProductCode'
    )?.setValue('');


    this.productForm.get(
      'SKU'
    )?.setValue('');


    this.productForm.get(
      'Barcode'
    )?.setValue('');


    this.productForm.get(
      'PartNo'
    )?.setValue('');


    this.removeProductImage();

    this.removeThumbnailImage();


    setTimeout(() => {

      this.firstField?.focus();

    }, 300);

  }

// ============================================================
// GET TAX NAME
// ============================================================

getTaxName(taxCode: any): string {

  if (!taxCode) {
    return '';
  }

  const tax = this.taxOptions.find(
    (item: any) =>
      String(item.id).trim() === String(taxCode).trim()
  );

  return tax?.name || '';
}


// ============================================================
// GET GST PERCENT (with % sign, e.g. "12%")
// ------------------------------------------------------------
// Tax master's name is just the plain number (e.g. "12").
// This appends '%' for saving/display, without double-adding
// it if the master value already has one.
// ============================================================

getGstPercent(taxCode: any): string {

  const name = this.getTaxName(taxCode);

  if (!name) {
    return '';
  }

  return name.trim().endsWith('%')
    ? name.trim()
    : name.trim() + '%';
}


// ============================================================
// GET WARRANTY NAME
// ============================================================

getWarrantyName(warrantyCode: any): string {

  if (!warrantyCode) {
    return '';
  }

  const warranty = this.warrantyOptions.find(
    (item: any) =>
      String(item.id).trim() === String(warrantyCode).trim()
  );

  return warranty?.name || '';
}

  // ============================================================
  // CANCEL
  // ============================================================

  onCancelClick(): void {

    this.cancelled.emit();

  }

}