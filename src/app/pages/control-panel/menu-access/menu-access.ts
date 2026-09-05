import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Breadcrumb, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb';
import { AlertService } from '../../../shared/services/alert.service';
import { ControlPanelService } from '../../../../services/control-panel.service';
import { environment } from '../../../../environments/environment';

interface AccessRow {
  fid?: number;
  HomeMenu: string;
  Menu?: string;
  module: string;      // NOTE: getControlPanelData proc la lowercase 'module' ah return aagum
  Display_Order?: string;
  opFormView: boolean;
  opFullControl: boolean;
  opInsert: boolean;
  opEdit: boolean;
  opDelete: boolean;
  opExport: boolean;
  opView: boolean;
  opPrint: boolean;
}

/** Which boolean columns get rendered/toggled - order match pannurom
 *  reference UI (erpkmk.com) oda Insert / Edit / View / FormView / Delete /
 *  Export / Print / Full Access column order ku. */
type AccessKey = 'opInsert' | 'opEdit' | 'opView' | 'opFormView' | 'opDelete' | 'opExport' | 'opPrint' | 'opFullControl';

const ACCESS_KEYS: AccessKey[] = ['opInsert', 'opEdit', 'opView', 'opFormView', 'opDelete', 'opExport', 'opPrint', 'opFullControl'];

@Component({
  selector: 'app-menu-access',
  standalone: true,
  imports: [CommonModule, FormsModule, Breadcrumb],
  templateUrl: './menu-access.html',
  styleUrl: './menu-access.scss'
})
export class MenuAccess implements OnInit {

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: 'ri-home-4-line' },
    { label: 'Control Panel' },
    { label: 'Menu Access' }
  ];

  readonly accessKeys = ACCESS_KEYS;

  roleOptions: { Role_Code: string; Role: string }[] = [];
  selectedRole = '';
  searchTerm = '';

  /** flat list - reference UI la Home Menu oru column ah than varudhu,
   *  thani thani group section ah illa */
  rows: AccessRow[] = [];
  loading = false;
  loaded = false;

  constructor(
    private controlPanelService: ControlPanelService,
    private http: HttpClient,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.http.get(`${environment.apiUrl}/api/role/RoleList`).subscribe({
      next: (res: any) => {
        this.roleOptions = res?.data || [];
      },
      error: () => this.alert.error('Role list load aagala')
    });
  }

  /** Role dropdown maarina odane auto load (reference UI la "View" button
   *  irundhalum, UX ku auto-load kooda vachurukom - button click pannalum
   *  same view() thaan call aagum) */
  onRoleChange(): void {
    this.view();
  }

  view(): void {
    if (!this.selectedRole) {
      this.rows = [];
      this.loaded = false;
      return;
    }
    this.loading = true;
    this.loaded = false;

    this.controlPanelService.GetRoleWiseAccess(this.selectedRole).subscribe({
      next: (res: any) => {
        const list: any[] = res?.data || [];

        // Backend 'True'/'False' (or sometimes lowercase 'true'/'false' -
        // the old save() used to write String(boolean) which is lowercase!)
        // string ah anupum, athanala case-insensitive ah check pannanum.
        // Idhu than mukkiya bug: 'True' oda exact match mattum check
        // pannirundhadhala, ROLE001 (Admin) mari lowercase 'true' oda save
        // aana rows, full access irundhum UI la unchecked ah kaatichu.
        list.forEach((row) => {
          ACCESS_KEYS.forEach((key) => {
            const v = row[key];
            row[key] = v === true || String(v).trim().toLowerCase() === 'true';
          });
        });

        this.rows = list;
        this.loading = false;
        this.loaded = true;
      },
      error: () => {
        this.alert.error('Access data load aagala');
        this.loading = false;
        this.loaded = true;
      }
    });
  }

get filteredRows(): AccessRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { return this.rows; }
    return this.rows.filter(
      (r) => (r.module || '').toLowerCase().includes(term)
          || (r.HomeMenu || '').toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  /** "Full Access" toggle click pannina, andha row oda ella permission um ON/OFF aagum */
  toggleFullControl(row: AccessRow): void {
    const val = row.opFullControl;
    row.opFormView = val;
    row.opInsert = val;
    row.opEdit = val;
    row.opDelete = val;
    row.opExport = val;
    row.opView = val;
    row.opPrint = val;
  }

  /** Header oda "Check All" - oru column full ah ON/OFF pannum (visible/filtered rows mattum) */
  isColumnAllChecked(key: AccessKey): boolean {
    return this.filteredRows.length > 0 && this.filteredRows.every((r) => r[key]);
  }

  toggleColumn(key: AccessKey, checked: boolean): void {
    this.filteredRows.forEach((row) => {
      row[key] = checked;
      if (key !== 'opFullControl' && !checked) { row.opFullControl = false; }
    });
  }

save(): void {
  if (!this.selectedRole) {
    this.alert.warning('Role select pannanum');
    return;
  }

  const toPascal = (v: boolean): string => {
    return v ? 'True' : 'False';
  };

  const payload = this.rows.map((row) => ({
    module: row.module,
    roleid: this.selectedRole,
    opFormView: toPascal(row.opFormView),
    opFullControl: toPascal(row.opFullControl),
    opInsert: toPascal(row.opInsert),
    opEdit: toPascal(row.opEdit),
    opDelete: toPascal(row.opDelete),
    opExport: toPascal(row.opExport),
    opView: toPascal(row.opView),
    opPrint: toPascal(row.opPrint)
  }));

  console.log('SAVE PAYLOAD:', payload);

  this.controlPanelService
    .SaveMenuAccess(this.selectedRole, payload)
    .subscribe({

      next: (res: any) => {

        console.log('SAVE API RESPONSE:', res);
        console.log('RESPONSE TYPE:', typeof res);

        // ------------------------------------------------
        // API sometimes returns JSON string
        // Convert it into object
        // ------------------------------------------------
        let response = res;

        if (typeof res === 'string') {
          try {
            response = JSON.parse(res);
          } catch (error) {
            console.error('Response JSON parse error:', error);

            this.alert.error('Invalid API response');
            return;
          }
        }

        console.log('PARSED RESPONSE:', response);

        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------
        if (response?.status === true) {

          this.alert.toast(
            response?.message || 'Access Saved Successfully'
          );

          return;
        }

        // ------------------------------------------------
        // FAILURE
        // ------------------------------------------------
        this.alert.error(
          response?.message || 'Cannot Save!'
        );
      },

      error: (error) => {

        console.error('SAVE API ERROR:', error);

        this.alert.error(
          error?.error?.message ||
          error?.message ||
          'Save aagala'
        );
      }
    });
}


}
