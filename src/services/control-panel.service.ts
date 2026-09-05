import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ControlPanelService {

  public baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }


  GetMenuGroupList() {
    return this.http.get(`${this.baseUrl}/api/ControlPanelMenu/list`);
  }


  GetMenuGroup(groupIndex: string) {
    return this.http.get(`${this.baseUrl}/api/ControlPanelMenu/${groupIndex}`);
  }


  SaveMenuGroup(data: any) {
    return this.http.post(`${this.baseUrl}/api/ControlPanelMenu/save`, data);
  }


  UpdateMenuGroup(groupIndex: string, data: any) {
    return this.http.post(`${this.baseUrl}/api/ControlPanelMenu/update/${groupIndex}`, data);
  }


  DeleteMenuGroup(groupIndex: string) {
    return this.http.get(`${this.baseUrl}/api/ControlPanelMenu/delete/${groupIndex}`);
  }

  GetSubMenuList() {
    return this.http.get(`${this.baseUrl}/api/submenu/list`);
  }

  /** Single record -> GET api/submenu/{fid} */
  GetSubMenu(id: string) {
    return this.http.get(`${this.baseUrl}/api/submenu/${id}`);
  }

  /** Add -> POST api/submenu/save (SubMenuImg base64 optional) */
  SaveSubMenu(data: any) {
    return this.http.post(`${this.baseUrl}/api/submenu/save`, data);
  }

  /** Edit -> POST api/submenu/update/{fid} */
  UpdateSubMenu(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/api/submenu/update/${id}`, data);
  }

  /** Soft delete (Is_Active='D') -> GET api/submenu/delete/{fid} */
  DeleteSubMenu(id: string) {
    return this.http.get(`${this.baseUrl}/api/submenu/delete/${id}`);
  }

  // =================================================================
  // MENU ACCESS  (api/MenuAccess) -> CONTROLPANEL table
  // =================================================================

  /** "Menu Access" screen la role select pannina odane ELLA module um
   *  checkbox status oda kaatanum -> GET api/MenuAccess/{roleId}
   *  (SP: getControlPanelData) */
  GetRoleWiseAccess(roleId: string) {
    return this.http.get(`${this.baseUrl}/api/MenuAccess/${roleId}`);
  }

  /** Save checkbox grid -> POST api/MenuAccess/save/{roleId}
   *  body = MenuAccess[] (module, opFormView, opFullControl, opInsert,
   *  opEdit, opDelete, opExport, opView, opPrint) */
  // SaveMenuAccess(roleId: string, data: any[]) {
  //   return this.http.post(`${this.baseUrl}/api/MenuAccess/save/${roleId}`, data);
  // }

  SaveMenuAccess(roleId: string, data: any[]) {
  return this.http.post(
    `${this.baseUrl}/api/MenuAccess/save/${roleId}`,
    data
  );
}
  /** Login/Sidebar ku - role ku access iruka modules mattum
   *  -> GET api/MenuAccess/accessMenu/{roleId} (SP: get_AccessMenu) */
  GetAccessMenu(roleId: string) {
    return this.http.get(`${this.baseUrl}/api/MenuAccess/accessMenu/${roleId}`);
  }
}
