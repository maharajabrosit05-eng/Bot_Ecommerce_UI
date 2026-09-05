import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  template: `
    <div class="action-btns">
      <button class="btn-icon-sm edit" [title]="editTitle" (click)="onEdit()">
        <i class="ri-edit-line"></i>
      </button>
      <button class="btn-icon-sm delete" [title]="deleteTitle" (click)="onDelete()">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  `
})
export class ActionButtons {
  @Input() row: any = null;
  @Input() editTitle = 'Edit';
  @Input() deleteTitle = 'Delete';

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onEdit(): void {
    this.edit.emit(this.row);
  }

  onDelete(): void {
    this.delete.emit(this.row);
  }
}
