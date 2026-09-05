import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { Breadcrumb, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb';
import { ActionButtons } from '../../../shared/components/action-buttons/action-buttons';
import { AlertService } from '../../../shared/services/alert.service';
import { ControlPanelService } from '../../../../services/control-panel.service';

interface HomeMenuRow {
  fid?: number;
  HomeMenu: string;
  groupIndex?: string;

  // IMPORTANT:
  // API / HTML number input may return number,
  // so support both string and number.
  Display_Order: string | number;

  SubMenuIcon?: string;
  Is_Active: string;

  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'action';
}

@Component({
  selector: 'app-master-menu-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    Breadcrumb,
    ActionButtons
  ],
  templateUrl: './master-menu-group.html',
  styleUrl: './master-menu-group.scss'
})
export class MasterMenuGroup implements OnInit {

  breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: 'ri-home-4-line'
    },
    {
      label: 'Control Panel'
    },
    {
      label: 'Home Menu Group'
    }
  ];

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  columns: Column[] = [
    {
      key: 'sno',
      label: 'S.No'
    },
    {
      key: 'HomeMenu',
      label: 'Home Menu'
    },
    {
      key: 'Display_Order',
      label: 'Display Order'
    },
    {
      key: 'Is_Active',
      label: 'Is_Active',
      type: 'status'
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action'
    }
  ];

  // ============================================================
  // DATA
  // ============================================================

  list: HomeMenuRow[] = [];
  filteredData: HomeMenuRow[] = [];
  searchList: HomeMenuRow[] = [];

  searchTerm = '';

  // ============================================================
  // PAGINATION
  // ============================================================

  page = 1;
  pageSize = 10;
  totalRecords = 0;

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

  // ============================================================
  // MODAL
  // ============================================================

  showModal = false;
  isEditMode = false;

  form: HomeMenuRow = this.emptyForm();

  // ============================================================
  // STATUS
  // ============================================================

  statusOptions = [
    {
      id: 'A',
      name: 'Active'
    },
    {
      id: 'D',
      name: 'Inactive'
    }
  ];

  get isActiveChecked(): boolean {
    return this.form.Is_Active === 'A';
  }

  set isActiveChecked(value: boolean) {
    this.form.Is_Active = value ? 'A' : 'D';
  }

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private controlPanelService: ControlPanelService,
    private alert: AlertService
  ) {}

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
    this.loadList();
  }

  // ============================================================
  // EMPTY FORM
  // ============================================================

  private emptyForm(): HomeMenuRow {
    return {
      HomeMenu: '',
      Display_Order: '',
      SubMenuIcon: '',
      Is_Active: 'A'
    };
  }

  // ============================================================
  // PAGINATION
  // ============================================================

  onRecordsChange(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.updateDisplayedData();
  }

  onSearch(): void {
    this.page = 1;
    this.updateDisplayedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  updateDisplayedData(): void {

    let data = [...this.list];

    // SEARCH
    if (this.searchTerm.trim()) {

      const term = this.searchTerm
        .trim()
        .toLowerCase();

      data = data.filter(row =>
        String(row.HomeMenu || '')
          .toLowerCase()
          .includes(term)
      );
    }

    // TOTAL
    this.totalRecords = data.length;

    this.filteredData = data;

    // PAGINATION
    const start =
      (this.page - 1) * this.pageSize;

    this.searchList = data.slice(
      start,
      start + this.pageSize
    );
  }

  get startRecord(): number {
    return this.totalRecords === 0
      ? 0
      : (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.page * this.pageSize,
      this.totalRecords
    );
  }

  get totalPages(): number {
    return Math.ceil(
      this.totalRecords / this.pageSize
    ) || 1;
  }

  getPageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages
      },
      (_, i) => i + 1
    );
  }

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

  // ============================================================
  // LOAD LIST
  // ============================================================

  loadList(): void {

    this.controlPanelService
      .GetMenuGroupList()
      .subscribe({

        next: (res: any) => {

          const data = Array.isArray(res?.data)
            ? res.data
            : [];

          this.list = data.sort(
            (a: HomeMenuRow, b: HomeMenuRow) =>
              Number(a.Display_Order) -
              Number(b.Display_Order)
          );

          this.page = 1;

          this.updateDisplayedData();
        },

        error: (error) => {

          console.error(
            'Home Menu List Error:',
            error
          );

          this.alert.error(
            'Home Menu list load aagala'
          );
        }
      });
  }

  // ============================================================
  // ADD MODAL
  // ============================================================

  openAddModal(): void {

    this.isEditMode = false;

    this.form = this.emptyForm();

    this.showModal = true;
  }

  // ============================================================
  // EDIT MODAL
  // ============================================================

  openEditModal(row: HomeMenuRow): void {

    this.isEditMode = true;

    this.form = {
      ...row,

      // Convert to string for consistent form handling
      Display_Order: String(
        row.Display_Order ?? ''
      ),

      Is_Active:
        row.Is_Active === 'A'
          ? 'A'
          : 'D'
    };

    this.showModal = true;
  }

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  closeModal(): void {
    this.showModal = false;
  }

  // ============================================================
  // SAVE / UPDATE
  // ============================================================

  save(): void {

    // ----------------------------------------------------------
    // HOME MENU VALIDATION
    // ----------------------------------------------------------

    const homeMenu =
      String(this.form.HomeMenu ?? '').trim();

    if (!homeMenu) {

      this.alert.warning(
        'Home Menu name podanum'
      );

      return;
    }

    // ----------------------------------------------------------
    // DISPLAY ORDER VALIDATION
    // ----------------------------------------------------------

    // IMPORTANT FIX:
    // Number value-ku .trim() call panna koodathu.
    const displayOrder =
      String(
        this.form.Display_Order ?? ''
      ).trim();

    if (!displayOrder) {

      this.alert.warning(
        'Display Order podanum'
      );

      return;
    }

    // Only positive whole number
    const displayOrderNumber =
      Number(displayOrder);

    if (
      !Number.isInteger(displayOrderNumber) ||
      displayOrderNumber <= 0
    ) {

      this.alert.warning(
        'Display Order valid number ah irukanum'
      );

      return;
    }

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload = {

      HomeMenu: homeMenu,

      // Backend model currently expects string,
      // so send it as string.
      Display_Order: displayOrder,

      Is_Active:
        this.form.Is_Active === 'A'
          ? 'A'
          : 'D'
    };

    console.log(
      'Control Panel Payload:',
      payload
    );

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    if (
      this.isEditMode &&
      this.form.groupIndex
    ) {

      this.controlPanelService
        .UpdateMenuGroup(
          this.form.groupIndex,
          payload
        )
        .subscribe({

          next: (res: any) => {

            this.handleSaveResponse(
              res,
              'Updated Successfully'
            );
          },

          error: (error) => {

            console.error(
              'Update Error:',
              error
            );

            this.alert.error(
              'Update aagala'
            );
          }
        });

      return;
    }

    // ----------------------------------------------------------
    // INSERT
    // ----------------------------------------------------------

    this.controlPanelService
      .SaveMenuGroup(payload)
      .subscribe({

        next: (res: any) => {

          this.handleSaveResponse(
            res,
            'Saved Successfully'
          );
        },

        error: (error) => {

          console.error(
            'Save Error:',
            error
          );

          this.alert.error(
            'Save aagala'
          );
        }
      });
  }

  // ============================================================
  // SAVE / UPDATE RESPONSE
  // ============================================================

  private handleSaveResponse(
    res: any,
    defaultMessage: string
  ): void {

    console.log(
      'API Response:',
      res
    );

    if (res?.status) {

      this.alert.toast(
        res.message ||
        defaultMessage
      );

      this.closeModal();

      this.loadList();

    } else {

      this.alert.error(
        res?.message ||
        'Cannot Save!'
      );
    }
  }

  // ============================================================
  // SOFT DELETE
  // ============================================================

  async remove(
    row: HomeMenuRow
  ): Promise<void> {

    if (!row.groupIndex) {
      return;
    }

    const ok =
      await this.alert.confirmDelete(
        'Home Menu Delete pannalama?'
      );

    if (!ok) {
      return;
    }

    this.controlPanelService
      .DeleteMenuGroup(
        row.groupIndex
      )
      .subscribe({

        next: (res: any) => {

          if (res?.status) {

            this.alert.toast(
              res.message ||
              'Deleted Successfully'
            );

            this.loadList();

          } else {

            this.alert.error(
              res?.message ||
              'Cannot Delete!'
            );
          }
        },

        error: (error) => {

          console.error(
            'Delete Error:',
            error
          );

          this.alert.error(
            'Delete aagala'
          );
        }
      });
  }
}