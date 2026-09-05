import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const SESSION_KEY = 'growth_admin_session';

@Injectable({ providedIn: 'root' })
export class AuthService {


  /** reactive login state the whole app can read */
  isLoggedIn = signal<boolean>(this.readSession() !== null);
  currentUser = signal<AdminUser | null>(this.readSession());

  constructor(private http: HttpClient) { }

  private readSession(): AdminUser | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }

  async login(userName: string, password: string): Promise<{ ok: boolean; message?: string }> {

    try {

      const body = {
        userName,
        password
      };

      const response: any = await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/api/Login`,
          body
        )
      );

      // Real API: { status, message, token, oid, eid, user: { UserCode, UserName, RoleCode, RoleName, EmpId, EmpName, Branch } }
      if (!response.status) {
        return {
          ok: false,
          message: response.message || 'Invalid Username or Password'
        };
      }

      const apiUser = response?.user;

      if (!apiUser) {
        return {
          ok: false,
          message: 'User object not received from API'
        };
      }

      const user: AdminUser = {

        name: apiUser.empName || apiUser.userName,

        email: apiUser.userName,

        role: apiUser.roleName || apiUser.roleCode,

        avatar: 'img/default-user.png'

      };

      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(user)
      );

      // ★ NEW: store the JWT + the plain OID/EID values. These get attached
      // to every request by authInterceptor — required by the backend's
      // JwtService.GetJwtClaimIsValid() check.
      if (response.token) {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('oid', response.oid ?? '');
        sessionStorage.setItem('eid', response.eid ?? '');
      }

      localStorage.setItem('UserName', apiUser.userName ?? '');
      localStorage.setItem('UserCode', apiUser.userCode ?? '');
      localStorage.setItem('Branch', apiUser.branch ?? '');
      localStorage.setItem('BranchCode', apiUser.branchCode ?? '');
      localStorage.setItem('RoleCode', apiUser.roleCode ?? '');
      localStorage.setItem('RoleName', apiUser.roleName ?? '');
      localStorage.setItem('EmpName', apiUser.empName ?? '');

      // ==========================================================
      // CONTROL PANEL: Role code vachu, andha role ku access iruka
      // menu/module list ah fetch panni 'User_Rights' la store
      // pannurom. Sidebar (Sidebar component) ithai vachithaan
      // dynamic ah menu build pannum.
      // ==========================================================
      await this.loadUserRights(apiUser.roleCode);

      this.currentUser.set(user);

      this.isLoggedIn.set(true);

      return {
        ok: true
      };

    }
    catch (err) {

      return {
        ok: false,
        message: 'Server Connection Failed'
      };

    }

  }

  private async loadUserRights(roleCode: string): Promise<void> {

    if (!roleCode) {
      localStorage.setItem('User_Rights', JSON.stringify([]));
      return;
    }

    try {

      const res: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/api/MenuAccess/accessMenu/${roleCode}`)
      );

      const list: any[] = res?.data || [];

      list.forEach((row) => {
        Object.keys(row).forEach((key) => {
          const v = row[key];
          if (typeof v === 'string' && (v.toLowerCase() === 'true' || v.toLowerCase() === 'false')) {
            row[key] = v.toLowerCase() === 'true';
          }
        });
      });

      const menuRights = list.filter((x) => x.opFormView === true);

      localStorage.setItem('User_Rights', JSON.stringify(menuRights));

    } catch (err) {
      console.error('User_Rights load failed:', err);
      localStorage.setItem('User_Rights', JSON.stringify([]));
    }
  }

logout(): void {

  // Session Storage
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('oid');
  sessionStorage.removeItem('eid');

  // Local Storage
  localStorage.removeItem('UserName');
  localStorage.removeItem('UserCode');
  localStorage.removeItem('Branch');
  localStorage.removeItem('BranchCode');
  localStorage.removeItem('RoleCode');
  localStorage.removeItem('RoleName');
  localStorage.removeItem('EmpName');
  localStorage.removeItem('User_Rights');

  // Reset Signals
  this.currentUser.set(null);
  this.isLoggedIn.set(false);

}
}