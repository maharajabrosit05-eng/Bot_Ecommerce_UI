import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { Breadcrumb, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb';
import { ActionButtons } from '../../../shared/components/action-buttons/action-buttons';
import { AlertService } from '../../../shared/services/alert.service';
import { ControlPanelService } from '../../../../services/control-panel.service';

interface SubMenuRow {
  fid?: number;
  HomeMenu: string;
  Menu?: string;
  Module: string;
  groupIndex?: string;
  RouterLink?: string;
  SubMenuIcon?: string;
  SubMenuImg?: string;
  Display_Order?: string;
  Is_Active: string;
  [key: string]: any;   // dynamic column access (row[col.key]) ku
}

/** Column config — table columns dynamic ah define pannum. type:
 *  'text' | 'status' | 'action' | 'icon' (icon cell ah render pannum) */
interface Column {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'action' | 'icon';
}

@Component({
  selector: 'app-sub-menu-group',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, Breadcrumb, ActionButtons],
  templateUrl: './sub-menu-group.html',
  styleUrl: './sub-menu-group.scss'
})
export class SubMenuGroup implements OnInit {

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: 'ri-home-4-line' },
    { label: 'Control Panel' },
    { label: 'Sub Menu Group' }
  ];

  /** Dynamic columns — oru array la manage pannalam, edhachu page la reuse */
  columns: Column[] = [
    { key: 'sno', label: 'S.No' },
    { key: 'HomeMenu', label: 'Home Menu' },
    { key: 'Module', label: 'Module' },
    { key: 'RouterLink', label: 'Router Link' },
    { key: 'SubMenuIcon', label: 'Icon', type: 'icon' },
    { key: 'Display_Order', label: 'Display Order' },
    { key: 'Is_Active', label: 'Is_Active', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'action' }
  ];

  list: SubMenuRow[] = [];
  homeMenuOptions: { id: string; name: string }[] = [];
  searchTerm = '';

  /** reference UI oda ACTIVE / INACTIVE / SHOW ALL filter tabs.
   *  NOTE: DB la soft-delete/inactive flag 'D' (NOT 'N') - DeleteSubMenu()
   *  API 'Is_Active' ah 'D' ah than update pannum, so idha match pannanum. */
  statusTab: 'A' | 'D' | 'ALL' = 'A';

  page = 1;
  pageSize = 10;

  // ---------- Records dropdown (all-products pattern) ----------
  recordsOptions = [
    { id: 10, name: '10 Records' },
    { id: 25, name: '25 Records' },
    { id: 50, name: '50 Records' },
    { id: 100, name: '100 Records' }
  ];

  onRecordsChange(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
  }
  // ---------- End Records dropdown ----------

  showModal = false;
  isEditMode = false;
  form: SubMenuRow = this.emptyForm();

  statusOptions = [
    { id: 'A', name: 'Active' },
    { id: 'D', name: 'Inactive' }
  ];

  /** Toggle switch state <-> Is_Active ('A'/'D') mapping */
  get isActiveChecked(): boolean {
    return this.form.Is_Active === 'A';
  }
  set isActiveChecked(val: boolean) {
    this.form.Is_Active = val ? 'A' : 'D';
  }

  /** commonly used remixicon classes — free ah type panni vera icon-um kudukalam */
  iconSuggestions = [
    'ri-list-check', 'ri-add-circle-line', 'ri-price-tag-3-line', 'ri-file-list-3-line',
    'ri-time-line', 'ri-arrow-go-back-line', 'ri-user-line', 'ri-star-smile-line',
    'ri-stack-line', 'ri-error-warning-line', 'ri-line-chart-line', 'ri-global-line',
    'ri-user-settings-line', 'ri-equalizer-line', 'ri-menu-2-line', 'ri-list-settings-line',
    'ri-shield-user-line'
  ];

  constructor(
    private controlPanelService: ControlPanelService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.loadHomeMenus();
    this.loadList();
  }

  private emptyForm(): SubMenuRow {
    return {
      HomeMenu: '', Menu: '', Module: '', RouterLink: '',
      SubMenuIcon: '', Is_Active: 'A'
    };
  }

  /** search + status tab ella filter panniya full list (pagination ku munnadi) */
  get filteredList(): SubMenuRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.list.filter((x) => {
      const matchesStatus = this.statusTab === 'ALL' || x.Is_Active === this.statusTab;
      if (!matchesStatus) { return false; }
      if (!term) { return true; }
      return (x.Module || '').toLowerCase().includes(term)
          || (x.HomeMenu || '').toLowerCase().includes(term);
    });
  }

  /** current page ku correspond aagura rows mattum */
  get pagedList(): SubMenuRow[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  get totalRecords(): number {
    return this.filteredList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }

  get startRecord(): number {
    return this.totalRecords === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.page * this.pageSize, this.totalRecords);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) { return; }
    this.page = page;
  }

  setStatusTab(tab: 'A' | 'D' | 'ALL'): void {
    this.statusTab = tab;
    this.page = 1;
  }

onSearchChange(): void {
    this.page = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
  }

  loadHomeMenus(): void {
    this.controlPanelService.GetMenuGroupList().subscribe({
      next: (res: any) => {
        this.homeMenuOptions = (res?.data || []).map((x: any) => ({ id: x.HomeMenu, name: x.HomeMenu }));
      }
    });
  }

  loadList(): void {
    this.controlPanelService.GetSubMenuList().subscribe({
      next: (res: any) => { this.list = res?.data || []; this.page = 1; },
      error: () => this.alert.error('Sub Menu list load aagala')
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(row: SubMenuRow): void {
    this.isEditMode = true;
    this.form = { ...row, SubMenuImg: '' };   // image field always fresh (optional re-upload)
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  /** file select pannina odane base64 ah convert pannirom (S3 upload API ku) */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) { return; }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.form.SubMenuImg = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save(): void {

    if (!this.form.HomeMenu?.trim()) {
      this.alert.warning('Home Menu select pannanum');
      return;
    }
    if (!this.form.Module?.trim()) {
      this.alert.warning('Module name podanum');
      return;
    }

    const payload = {
      HomeMenu: this.form.HomeMenu,
      Menu: this.form.Menu || this.form.HomeMenu,
      Module: this.form.Module,
      RouterLink: this.form.RouterLink || '',
      SubMenuIcon: this.form.SubMenuIcon || 'ri-checkbox-blank-circle-line',
      SubMenuImg: this.form.SubMenuImg || '',
      Display_Order: this.form.Display_Order || '1',
      Is_Active: this.form.Is_Active
    };

    if (this.isEditMode && this.form.fid) {
      this.controlPanelService.UpdateSubMenu(String(this.form.fid), payload).subscribe({
        next: (res: any) => this.handleSaveResponse(res),
        error: () => this.alert.error('Update aagala')
      });
    } else {
      this.controlPanelService.SaveSubMenu(payload).subscribe({
        next: (res: any) => this.handleSaveResponse(res),
        error: () => this.alert.error('Save aagala')
      });
    }
  }

  private handleSaveResponse(res: any): void {
    if (res?.status) {
      this.alert.toast(res.message || 'Saved Successfully');
      this.closeModal();
      this.loadList();
    } else {
      this.alert.error(res?.message || 'Cannot Save!');
    }
  }

  async remove(row: SubMenuRow): Promise<void> {
    if (!row.fid) { return; }
    const ok = await this.alert.confirmDelete('Sub Menu Delete pannalama?');
    if (!ok) { return; }

    this.controlPanelService.DeleteSubMenu(String(row.fid)).subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.alert.toast('Deleted Successfully');
          this.loadList();
        } else {
          this.alert.error(res?.message || 'Cannot Delete!');
        }
      },
      error: () => this.alert.error('Delete aagala')
    });
  }
}