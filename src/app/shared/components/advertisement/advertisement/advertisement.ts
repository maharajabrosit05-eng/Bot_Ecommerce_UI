import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonService } from '../../../../../services/common.service';
import { AlertService } from '../../../services/alert.service';


type TabType = 'banner' | 'advertisement';
type PanelMode = 'add' | 'edit' | null;


@Component({
  selector: 'app-advertisement',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],

  templateUrl: './advertisement.html',
  styleUrl: './advertisement.scss',
})


export class Advertisement implements OnInit {


  // ==================== Tab control ====================

  activeTab: TabType = 'banner';


  // ==================== Lists ====================

  bannerList: any[] = [];

  adList: any[] = [];

  // ⭐ Filtered banner list (before pagination)
  filteredBannerList: any[] = [];

  // ⭐ Filtered advertisement list (before pagination)
  filteredAdList: any[] = [];

  // ⭐ Paginated lists (what actually renders in the table)
  pagedBannerList: any[] = [];

  pagedAdList: any[] = [];

  loadingList = false;



  // ==================== Banner Filters ====================

  bannerSearchText: string = '';


  // ==================== Advertisement Filters ====================

  adSearchText: string = '';

  selectedSlot: number = 0;


  // ==================== Slot Options ====================

  slotOptions = [

    { id: 1, name: 'Slot 1 — Home Page — Below Hero' },

    { id: 2, name: 'Slot 2 — Home Page — After Category Showcase' },

    { id: 3, name: 'Slot 3 — Home Page — Between Category Products' },

    { id: 4, name: 'Slot 4 — Home Page — Before Testimonials' },

    { id: 5, name: 'Slot 5 — Home Page — Spare' },

    { id: 6, name: 'Slot 6 — Product Page' },

    { id: 7, name: 'Slot 7 — Product Detail Page' },

    { id: 8, name: 'Slot 8 — Cart Page' }

  ];


  // ⭐ Dropdown used only for filtering
  slotFilterOptions = [

    { id: 0, name: 'All Slots' },

    ...this.slotOptions

  ];



  // ==================== ⭐ PAGINATION ====================

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  recordsOptions = [

    { id: 10, name: '10 Records' },

    { id: 25, name: '25 Records' },

    { id: 50, name: '50 Records' },

    { id: 100, name: '100 Records' }

  ];



  // ==================== Side panel state ====================

  showPanel = false;

  panelMode: PanelMode = null;



  // ==================== Forms ====================

  bannerForm: FormGroup;

  adForm: FormGroup;



  // ==================== Image preview ====================

  bannerImagePreview: string | null = null;

  adImagePreview: string | null = null;



  defaultImage = 'assets/img/no-adds.jpg';



  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private alert: AlertService
  ) {


    // ==================== Banner Form ====================

    this.bannerForm = this.fb.group({

      Banner_Code: [''],

      Banner_Title: [''],

      Image_Url: ['', Validators.required],

      Redirect_Url: [''],

      Display_Order: [
        0,
        Validators.required
      ]

    });



    // ==================== Advertisement Form ====================

    this.adForm = this.fb.group({

      Advertisement_Code: [''],

      Slot_No: [
        1,
        Validators.required
      ],

      Ad_Title: [''],

      Image_Url: [
        '',
        Validators.required
      ],

      Redirect_Url: [''],

      Display_Order: [
        0,
        Validators.required
      ],

      Start_Date: [null],

      End_Date: [null]

    });

  }



  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadActiveTabData();

  }



  // =========================================================
  // TAB SWITCH
  // =========================================================

  switchTab(tab: TabType): void {

    if (this.activeTab === tab) {
      return;
    }


    this.activeTab = tab;

    this.closePanel();


    // ⭐ Reset filters of the tab we're leaving
    if (tab === 'advertisement') {

      this.adSearchText = '';

      this.selectedSlot = 0;

    } else {

      this.bannerSearchText = '';

    }


    // ⭐ Reset pagination when tab changes
    this.page = 1;

    this.pageSize = 10;


    this.loadActiveTabData();

  }



  // =========================================================
  // LOAD ACTIVE TAB
  // =========================================================

  loadActiveTabData(): void {

    if (this.activeTab === 'banner') {

      this.getBannerList();

    } else {

      this.getAdvertisementList();

    }

  }



  // =========================================================
  // LOAD BANNERS
  // =========================================================

  getBannerList(): void {

    this.loadingList = true;


    this.commonService.GetBannerList().subscribe({

      next: (res: any) => {

        this.bannerList = res?.data || [];

        this.loadingList = false;

        // ⭐ Apply search (also resets page + re-paginates)
        this.filterBanners();

      },


      error: () => {

        this.bannerList = [];

        this.filteredBannerList = [];

        this.loadingList = false;

        this.updatePagination();

      }

    });

  }



  // =========================================================
  // LOAD ADVERTISEMENTS
  // =========================================================

  getAdvertisementList(): void {

    this.loadingList = true;


    this.commonService.GetAdvertisementList().subscribe({

      next: (res: any) => {

        this.adList = res?.data || [];

        // ⭐ Apply filters after API data comes (this also re-paginates)
        this.filterAdvertisements();

        this.loadingList = false;

      },


      error: () => {

        this.adList = [];

        this.filteredAdList = [];

        this.loadingList = false;

        this.updatePagination();

      }

    });

  }



  // =========================================================
  // ⭐ FILTER BANNERS
  // Search only
  // =========================================================

  filterBanners(): void {

    const search = this.bannerSearchText
      .trim()
      .toLowerCase();


    if (!search) {

      this.filteredBannerList = [...this.bannerList];

    } else {

      this.filteredBannerList = this.bannerList.filter((b: any) => {

        const title =
          String(b.Banner_Title || '')
            .toLowerCase();

        const code =
          String(b.Banner_Code || '')
            .toLowerCase();

        const redirectUrl =
          String(b.Redirect_Url || '')
            .toLowerCase();


        return (
          title.includes(search) ||
          code.includes(search) ||
          redirectUrl.includes(search)
        );

      });

    }


    // ⭐ Every time search changes, go back to page 1 and re-paginate
    this.page = 1;

    this.updatePagination();

  }



  // =========================================================
  // ⭐ CLEAR BANNER SEARCH
  // =========================================================

  clearBannerSearch(): void {

    this.bannerSearchText = '';

    this.filterBanners();

  }



  // =========================================================
  // ⭐ FILTER ADVERTISEMENTS
  // Search + Slot
  // =========================================================

  filterAdvertisements(): void {

    const search = this.adSearchText
      .trim()
      .toLowerCase();


    this.filteredAdList = this.adList.filter((ad: any) => {


      // ==========================================
      // SLOT FILTER
      // ==========================================

      const slotMatch =
        this.selectedSlot === 0 ||
        Number(ad.Slot_No) === Number(this.selectedSlot);



      // ==========================================
      // SEARCH FILTER
      // ==========================================

      if (!search) {

        return slotMatch;

      }


      const title =
        String(ad.Ad_Title || '')
          .toLowerCase();

      const code =
        String(ad.Advertisement_Code || '')
          .toLowerCase();

      const redirectUrl =
        String(ad.Redirect_Url || '')
          .toLowerCase();

      const slotName =
        this.getSlotLabel(ad.Slot_No)
          .toLowerCase();



      const searchMatch =
        title.includes(search) ||
        code.includes(search) ||
        redirectUrl.includes(search) ||
        slotName.includes(search);



      return slotMatch && searchMatch;

    });


    // ⭐ Every time filter changes, go back to page 1 and re-paginate
    this.page = 1;

    this.updatePagination();

  }



  // =========================================================
  // ⭐ CLEAR SEARCH ONLY
  // =========================================================

  clearAdSearch(): void {

    this.adSearchText = '';

    this.filterAdvertisements();

  }



  // =========================================================
  // ⭐ CLEAR ALL FILTERS
  // =========================================================

  clearAdFilters(): void {

    this.adSearchText = '';

    this.selectedSlot = 0;

    this.filterAdvertisements();

  }



  // =========================================================
  // ⭐ PAGINATION CORE
  // =========================================================

  updatePagination(): void {

    const source =
      this.activeTab === 'banner'
        ? this.filteredBannerList
        : this.filteredAdList;


    this.totalRecords = source.length;


    const start = (this.page - 1) * this.pageSize;

    const end = start + this.pageSize;


    if (this.activeTab === 'banner') {

      this.pagedBannerList = source.slice(start, end);

    } else {

      this.pagedAdList = source.slice(start, end);

    }

  }



  // ⭐ Records dropdown change
  onRecordsChange(size: number): void {

    this.pageSize = Number(size);

    this.page = 1;

    this.updatePagination();

  }



  // ⭐ Go to a specific page
  goToPage(p: number): void {

    if (p < 1 || p > this.totalPages) {
      return;
    }

    this.page = p;

    this.updatePagination();

  }



  // ⭐ Total pages
  get totalPages(): number {

    return Math.ceil(this.totalRecords / this.pageSize) || 1;

  }



  // ⭐ Start record number (for "Showing x to y of z")
  get startRecord(): number {

    if (this.totalRecords === 0) {
      return 0;
    }

    return ((this.page - 1) * this.pageSize) + 1;

  }



  // ⭐ End record number
  get endRecord(): number {

    return Math.min(
      this.page * this.pageSize,
      this.totalRecords
    );

  }



  // ⭐ Page number buttons
  getPageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

  }



  // =========================================================
  // SIDE PANEL — OPEN ADD
  // =========================================================

  openAddPanel(): void {

    this.panelMode = 'add';


    if (this.activeTab === 'banner') {


      this.bannerForm.reset({

        Banner_Code: '',

        Banner_Title: '',

        Image_Url: '',

        Redirect_Url: '',

        Display_Order: 0

      });


      this.bannerImagePreview = null;


    } else {


      this.adForm.reset({

        Advertisement_Code: '',

        Slot_No: 1,

        Ad_Title: '',

        Image_Url: '',

        Redirect_Url: '',

        Display_Order: 0,

        Start_Date: null,

        End_Date: null

      });


      this.adImagePreview = null;

    }


    this.showPanel = true;

  }



  // =========================================================
  // SIDE PANEL — OPEN EDIT
  // =========================================================

  openEditPanel(item: any): void {

    this.panelMode = 'edit';


    if (this.activeTab === 'banner') {


      this.bannerForm.patchValue({

        Banner_Code: item.Banner_Code,

        Banner_Title: item.Banner_Title,

        Image_Url: item.Image_Url,

        Redirect_Url: item.Redirect_Url,

        Display_Order: item.Display_Order

      });


      this.bannerImagePreview =
        item.Image_Url || null;


    } else {


      this.adForm.patchValue({

        Advertisement_Code:
          item.Advertisement_Code,

        Slot_No:
          Number(item.Slot_No),

        Ad_Title:
          item.Ad_Title,

        Image_Url:
          item.Image_Url,

        Redirect_Url:
          item.Redirect_Url,

        Display_Order:
          item.Display_Order,

        Start_Date:
          item.Start_Date
            ? item.Start_Date.split('T')[0]
            : null,

        End_Date:
          item.End_Date
            ? item.End_Date.split('T')[0]
            : null

      });


      this.adImagePreview =
        item.Image_Url || null;

    }


    this.showPanel = true;

  }



  // =========================================================
  // CLOSE PANEL
  // =========================================================

  closePanel(): void {

    this.showPanel = false;

    this.panelMode = null;

  }



  // =========================================================
  // IMAGE PICK — BANNER
  // =========================================================

  onBannerImagePick(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];


    if (!file) {
      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {

      const base64 =
        reader.result as string;


      this.bannerForm.patchValue({
        Image_Url: base64
      });


      this.bannerImagePreview =
        base64;

    };


    reader.readAsDataURL(file);

  }



  // =========================================================
  // IMAGE PICK — ADVERTISEMENT
  // =========================================================

  onAdImagePick(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];


    if (!file) {
      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {

      const base64 =
        reader.result as string;


      this.adForm.patchValue({
        Image_Url: base64
      });


      this.adImagePreview =
        base64;

    };


    reader.readAsDataURL(file);

  }



  // =========================================================
  // SAVE — BANNER
  // =========================================================

  saveBanner(): void {

    if (this.bannerForm.invalid) {

      this.bannerForm.markAllAsTouched();

      this.alert.error(
        'Please fill all required fields.'
      );

      return;

    }


    const formValue =
      this.bannerForm.value;


    const isEdit =
      this.panelMode === 'edit';


    const payload = {

      Banner_Code:
        formValue.Banner_Code,

      Banner_Title:
        formValue.Banner_Title,

      Image_Url:
        formValue.Image_Url,

      Redirect_Url:
        formValue.Redirect_Url,

      Display_Order:
        formValue.Display_Order,

      Created_By:
        'admin',

      Updated_By:
        'admin'

    };


    const request =
      isEdit

        ? this.commonService.UpdateBanner(
            payload
          )

        : this.commonService.SaveBanner(
            payload
          );


    request.subscribe({

      next: (res: any) => {


        if (res?.status === false) {

          this.alert.error(
            res.message ||
            'Banner save failed.'
          );

          return;

        }


        this.alert.toast(
          isEdit
            ? 'Banner updated'
            : 'Banner added'
        );


        this.closePanel();

        this.getBannerList();

      },


      error: () => {

        this.alert.error(
          'Banner save failed, try again.'
        );

      }

    });

  }



  // =========================================================
  // SAVE — ADVERTISEMENT
  // =========================================================

  saveAdvertisement(): void {

    if (this.adForm.invalid) {

      this.adForm.markAllAsTouched();

      this.alert.error(
        'Please fill all required fields.'
      );

      return;

    }


    const formValue =
      this.adForm.value;


    const isEdit =
      this.panelMode === 'edit';


    const payload = {

      Advertisement_Code:
        formValue.Advertisement_Code,

      Slot_No:
        formValue.Slot_No,

      Ad_Title:
        formValue.Ad_Title,

      Image_Url:
        formValue.Image_Url,

      Redirect_Url:
        formValue.Redirect_Url,

      Display_Order:
        formValue.Display_Order,

      Start_Date:
        formValue.Start_Date,

      End_Date:
        formValue.End_Date,

      Created_By:
        'admin',

      Updated_By:
        'admin'

    };


    const request =
      isEdit

        ? this.commonService.UpdateAdvertisement(
            payload
          )

        : this.commonService.SaveAdvertisement(
            payload
          );


    request.subscribe({

      next: (res: any) => {


        if (res?.status === false) {

          this.alert.error(
            res.message ||
            'Advertisement save failed.'
          );

          return;

        }


        this.alert.toast(

          isEdit
            ? 'Advertisement updated'
            : 'Advertisement added'

        );


        this.closePanel();

        this.getAdvertisementList();

      },


      error: () => {

        this.alert.error(
          'Advertisement save failed, try again.'
        );

      }

    });

  }



  // =========================================================
  // DELETE — BANNER
  // =========================================================

  async deleteBanner(item: any): Promise<void> {

    const confirmed =
      await this.alert.confirmDelete(

        'Delete this banner?',

        `"${item.Banner_Title || item.Banner_Code}" delete pannava?`

      );


    if (!confirmed) {
      return;
    }


    this.commonService
      .DeleteBanner(item.Banner_Code)
      .subscribe({

        next: (res: any) => {


          if (res?.status === false) {

            this.alert.error(
              res.message ||
              'Banner delete aaga mudiyala.'
            );

            return;

          }


          this.alert.toast(
            'Banner deleted'
          );


          this.getBannerList();

        },


        error: () => {

          this.alert.error(
            'Banner delete aaga mudiyala, try again.'
          );

        }

      });

  }



  // =========================================================
  // DELETE — ADVERTISEMENT
  // =========================================================

  async deleteAdvertisement(
    item: any
  ): Promise<void> {


    const confirmed =
      await this.alert.confirmDelete(

        'Delete this advertisement?',

        `"${item.Ad_Title || item.Advertisement_Code}" delete pannava?`

      );


    if (!confirmed) {
      return;
    }


    this.commonService
      .DeleteAdvertisement(
        item.Advertisement_Code
      )
      .subscribe({

        next: (res: any) => {


          if (res?.status === false) {

            this.alert.error(
              res.message ||
              'Advertisement delete aaga mudiyala.'
            );

            return;

          }


          this.alert.toast(
            'Advertisement deleted'
          );


          this.getAdvertisementList();

        },


        error: () => {

          this.alert.error(
            'Advertisement delete aaga mudiyala, try again.'
          );

        }

      });

  }



  // =========================================================
  // IMAGE HELPERS
  // =========================================================

  getImageSrc(
    url: string | null | undefined
  ): string {

    return url &&
           url.trim() !== ''

      ? url

      : this.defaultImage;

  }



  onImageError(event: Event): void {

    const target =
      event.target as HTMLImageElement;

    target.src =
      this.defaultImage;

  }



  // =========================================================
  // SLOT LABEL
  // =========================================================

  getSlotLabel(
    slotNo: number
  ): string {

    const match =
      this.slotOptions.find(
        s => s.id === Number(slotNo)
      );


    return match
      ? match.name
      : `Slot ${slotNo}`;

  }

}