import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * AlertService
 * ------------------------------------------------------------
 * SweetAlert2 ah oru edathula (ithula) than configure pandrom.
 * Vera edhu page/component venumnalum inject panni call pannalam:
 *
 *   constructor(private alert: AlertService) {}
 *
 *   this.alert.success('Saved successfully');
 *   this.alert.error('Something went wrong');
 *   const ok = await this.alert.confirmDelete();   // true/false
 *   this.alert.toast('Copied!');
 * ------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class AlertService {

  success(message: string, title: string = 'Success'): void {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonColor: '#4f7cff'
    });
  }

  error(message: string, title: string = 'Error'): void {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonColor: '#4f7cff'
    });
  }

  warning(message: string, title: string = 'Warning'): void {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonColor: '#4f7cff'
    });
  }

  info(message: string, title: string = 'Info'): void {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonColor: '#4f7cff'
    });
  }

  /** Delete/remove confirm — returns true na "Yes, delete" click pannaanga */
  async confirmDelete(
    title: string = 'Are you sure?',
    text: string = 'Intha record ah delete pannitta, mela mathala!'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#fd7272',
      cancelButtonColor: '#94a3b8'
    });
    return !!result.isConfirmed;
  }

  /** Generic yes/no confirm — returns true/false */
  async confirm(
    title: string,
    text: string = '',
    confirmButtonText: string = 'Yes'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f7cff'
    });
    return !!result.isConfirmed;
  }

  /** Small corner toast — success/error/info/warning notifications */
  toast(message: string, icon: SweetAlertIcon = 'success'): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
  }
}
