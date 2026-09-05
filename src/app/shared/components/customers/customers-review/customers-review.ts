import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterModule,
  Router
} from '@angular/router';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  FormBuilder,
  FormGroup
} from '@angular/forms';

import {
  NgSelectModule
} from '@ng-select/ng-select';

import {
  FlatpickrModule
} from 'angularx-flatpickr';

import {
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';

import {
  Breadcrumb,
  BreadcrumbItem
} from '../../breadcrumb/breadcrumb';

import {
  AlertService
} from '../../../services/alert.service';

import {
  ExportService,
  ExportColumn
} from '../../../services/export.service';

import {
  CommonService
} from '../../../../../services/common.service';


@Component({
  selector: 'app-customers-review',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    FlatpickrModule,
    Breadcrumb,
    NgbTooltipModule
  ],

  templateUrl: './customers-review.html',

  styleUrl: './customers-review.scss'
})


export class CustomersReview implements OnInit {


  // =========================================================
  // CUSTOMER REVIEW DATA
  // =========================================================

  reviewList: any[] = [];

  filteredData: any[] = [];

  searchList: any[] = [];


  // =========================================================
  // FILTER FORM
  // =========================================================

  filterForm: FormGroup;


  // =========================================================
  // SEARCH
  // =========================================================

  searchTerm = '';


  // =========================================================
  // PAGINATION
  // =========================================================

  page = 1;

  pageSize = 10;

  totalRecords = 0;


  // =========================================================
  // RECORD OPTIONS
  // =========================================================

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


  // =========================================================
  // BREADCRUMB
  // =========================================================

  breadcrumbs: BreadcrumbItem[] = [

    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: 'ri-home-4-line'
    },

    {
      label: 'Customers'
    },

    {
      label: 'Customer Reviews'
    }

  ];


  // =========================================================
  // EXPORT COLUMNS
  // =========================================================

  exportColumns: ExportColumn[] = [

    {
      header: 'Review Code',
      field: 'Review_Code'
    },

    {
      header: 'Customer Code',
      field: 'Customer_Code'
    },

    {
      header: 'Customer Name',
      field: 'Customer_Name'
    },

    {
      header: 'Email',
      field: 'Email_Id'
    },

    {
      header: 'Mobile No',
      field: 'Mobile_No'
    },

    {
      header: 'Product Code',
      field: 'Product_Code'
    },

    {
      header: 'Product Name',
      field: 'Product_Name'
    },

    {
      header: 'Rating',
      field: 'Rating'
    },

    {
      header: 'Review Title',
      field: 'Review_Title'
    },

    {
      header: 'Review Message',
      field: 'Review_Message'
    },

    {
      header: 'Approved',
      field: 'Is_Approved'
    },

    {
      header: 'Status',
      field: 'Is_Active'
    },

    {
      header: 'Created By',
      field: 'Created_By'
    },

    {
      header: 'Created On',
      field: 'Created_On'
    },

    {
      header: 'Branch',
      field: 'Branch_Code'
    }

  ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private fb: FormBuilder,

    public commonService: CommonService,

    private alert: AlertService,

    private exportSvc: ExportService,

    private router: Router

  ) {

    this.filterForm = this.fb.group({

      fromDate: [null],

      toDate: [null]

    });

  }


  // =========================================================
  // COMPONENT INIT
  // =========================================================

  ngOnInit(): void {

    const today =
      this.getTodayDate();


    this.filterForm.patchValue({

      fromDate: today,

      toDate: today

    });


    // Load Customer Reviews
    this.GetAll();

  }


  // =========================================================
  // GET TODAY DATE
  // =========================================================

  private getTodayDate(): string {

    const today =
      new Date();


    const year =
      today.getFullYear();


    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        today.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;

  }


  // =========================================================
  // GET CUSTOMER REVIEW LIST
  // ACTIVE RECORDS ONLY
  // =========================================================

  GetAll(): void {

    this.commonService
      .Get_CustomerReviewList()
      .subscribe({

        next: (res: any) => {

          console.log(
            'Customer Review API Response:',
            res
          );


          // =================================================
          // GET API DATA
          // =================================================

          const rawList =
            Array.isArray(res?.data)

              ? res.data.filter(
                (item: any) =>
                  item.Is_Active === 'A'
              )

              : [];


          // =================================================
          // MAP ACTIVE CUSTOMER REVIEW DATA
          // =================================================

          this.reviewList =
            rawList.map((item: any) => ({

              Review_Id:
                item.Review_Id ?? '',

              Review_Code:
                item.Review_Code ?? '',

              Customer_Code:
                item.Customer_Code ?? '',

              Customer_Name:
                item.Customer_Name ?? '',

              Email_Id:
                item.Email_Id ?? '',

              Mobile_No:
                item.Mobile_No ?? '',

              Product_Code:
                item.Product_Code ?? '',

              Product_Name:
                item.Product_Name ?? '',

              Rating:
                Number(item.Rating) || 0,

              Review_Title:
                item.Review_Title ?? '',

              Review_Message:
                item.Review_Message ?? '',

              Is_Approved:
                item.Is_Approved ?? 'N',

              Is_Active:
                item.Is_Active ?? 'D',

              Created_By:
                item.Created_By ?? '',

              Created_On:
                item.Created_On ?? '',

              Updated_By:
                item.Updated_By ?? '',

              Updated_On:
                item.Updated_On ?? '',

              Company_Code:
                item.Company_Code ?? '',

              Branch_Code:
                item.Branch_Code ?? ''

            }));


          console.log(
            'ACTIVE Customer Review List:',
            this.reviewList
          );


          // =================================================
          // UPDATE TABLE
          // =================================================

          this.page = 1;

          this.updateDisplayedData();

        },


        error: (error: any) => {

          console.error(
            'Customer Review API Error:',
            error
          );


          this.reviewList = [];

          this.filteredData = [];

          this.searchList = [];

          this.totalRecords = 0;

        }

      });

  }

  // =========================================================
  // VIEW BUTTON
  // =========================================================

  viewReviews(): void {

    this.page = 1;

    this.updateDisplayedData();

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {

    this.page = 1;

    this.updateDisplayedData();

  }


  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.page = 1;

    this.updateDisplayedData();

  }


  // =========================================================
  // CLEAR FILTER
  // =========================================================

  clearFilter(): void {

    this.filterForm.reset({

      fromDate: null,

      toDate: null

    });


    this.searchTerm = '';

    this.page = 1;

    this.updateDisplayedData();

  }


  // =========================================================
  // RECORDS PER PAGE
  // =========================================================

  onRecordsChange(size: number): void {

    this.pageSize =
      Number(size);

    this.page = 1;

    this.updateDisplayedData();

  }


  // =========================================================
  // FILTER + SEARCH + PAGINATION
  // ACTIVE RECORDS ONLY
  // =========================================================

  updateDisplayedData(): void {

    // =======================================================
    // ACTIVE RECORDS ONLY
    // =======================================================

    let data =
      this.reviewList.filter(
        (item: any) =>
          item.Is_Active === 'A'
      );


    // =======================================================
    // SEARCH FILTER
    // =======================================================

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (term) {

      data =
        data.filter((item: any) => {

          return [

            item.Review_Code,

            item.Customer_Code,

            item.Customer_Name,

            item.Email_Id,

            item.Mobile_No,

            item.Product_Code,

            item.Product_Name,

            item.Rating,

            item.Review_Title,

            item.Review_Message,

            item.Is_Approved,

            item.Is_Active,

            item.Created_By,

            item.Created_On,

            item.Branch_Code

          ].some(
            (value: any) =>

              value !== null &&
              value !== undefined &&

              String(value)
                .toLowerCase()
                .includes(term)

          );

        });

    }


    // =======================================================
    // TOTAL RECORDS
    // =======================================================

    this.totalRecords =
      data.length;


    // =======================================================
    // FILTERED DATA
    // =======================================================

    this.filteredData =
      data;


    // =======================================================
    // CHECK PAGE AFTER DELETE
    // =======================================================

    if (
      this.page > this.totalPages
    ) {

      this.page =
        this.totalPages;

    }


    // =======================================================
    // PAGINATION
    // =======================================================

    const start =
      (this.page - 1) *
      this.pageSize;


    const end =
      start +
      this.pageSize;


    this.searchList =
      data.slice(start, end);

  }

  // =========================================================
  // START RECORD
  // =========================================================

  get startRecord(): number {

    if (
      this.totalRecords === 0
    ) {

      return 0;

    }


    return (
      (this.page - 1) *
      this.pageSize
    ) + 1;

  }


  // =========================================================
  // END RECORD
  // =========================================================

  get endRecord(): number {

    return Math.min(

      this.page *
      this.pageSize,

      this.totalRecords

    );

  }


  // =========================================================
  // TOTAL PAGES
  // =========================================================

  get totalPages(): number {

    return Math.ceil(

      this.totalRecords /
      this.pageSize

    ) || 1;

  }


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  getPageNumbers(): number[] {

    return Array.from(

      {
        length:
          this.totalPages
      },

      (_, i) =>
        i + 1

    );

  }


  // =========================================================
  // GO TO PAGE
  // =========================================================

  goToPage(page: number): void {

    if (

      page < 1 ||

      page >
      this.totalPages

    ) {

      return;

    }


    this.page =
      page;


    this.updateDisplayedData();

  }


  // =========================================================
  // GET STAR ARRAY
  // =========================================================

  getStars(rating: any): number[] {

    const value =
      Number(rating) || 0;


    return Array.from(
      { length: 5 },
      (_, index) =>
        index < value ? 1 : 0
    );

  }


 // =========================================================
// DELETE CUSTOMER REVIEW
// SOFT DELETE: A -> D
// =========================================================

async deleteReview(
  review: any
): Promise<void> {

  // =======================================================
  // CONFIRM DELETE
  // =======================================================

  const confirmed =
    await this.alert.confirmDelete(

      'Delete this review?',

      `"${review.Review_Code}" delete pannava?`

    );


  if (!confirmed) {

    return;

  }


  // =======================================================
  // DELETE API
  // =======================================================

  this.commonService
    .DeleteCustomerReview(
      review.Review_Code
    )
    .subscribe({

      // =====================================================
      // SUCCESS
      // =====================================================

      next: (res: any) => {

        console.log(
          'Delete Review Response:',
          res
        );


        // ===================================================
        // API FAILURE
        // ===================================================

        if (
          res?.status === false
        ) {

          this.alert.error(
            res.message ||
            'Review delete aaga mudiyala.'
          );

          return;

        }


        // ===================================================
        // REMOVE FROM LOCAL LIST
        // ===================================================

        this.reviewList =
          this.reviewList.filter(

            (item: any) =>

              item.Review_Code !==
              review.Review_Code

          );


        // ===================================================
        // UPDATE TABLE
        // ===================================================

        this.updateDisplayedData();


        // ===================================================
        // SUCCESS MESSAGE
        // ===================================================

        this.alert.toast(
          'Customer review deleted successfully'
        );

      },


      // =====================================================
      // ERROR
      // =====================================================

      error: (error: any) => {

        console.error(
          'Delete Review API Error:',
          error
        );


        this.alert.error(
          'Review delete aaga mudiyala, try again.'
        );

      }

    });

}
  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  exportExcel(): void {

    const data =
      this.filteredData.length
        ? this.filteredData
        : this.reviewList;


    this.exportSvc.exportExcel(
      data,
      'Customer Reviews'
    );

  }


  // =========================================================
  // EXPORT PDF
  // =========================================================

  exportPdf(): void {

    const data =
      this.filteredData.length
        ? this.filteredData
        : this.reviewList;


    this.exportSvc.exportPdf(

      this.exportColumns,

      data,

      'Customer Reviews',

      'Customer Reviews Report'

    );

  }


  // =========================================================
  // PRINT
  // =========================================================

  printList(): void {

    const data =
      this.filteredData.length
        ? this.filteredData
        : this.reviewList;


    this.exportSvc.printData(

      'Customer Reviews',

      this.exportColumns,

      data

    );

  }

}