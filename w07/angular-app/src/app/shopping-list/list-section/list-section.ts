import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItem } from '../list-item/list-item';
import { ListEditor } from '../list-editor/list-editor';

@Component({
  selector: 'app-list-section',
  standalone: true,
  imports: [CommonModule, ListItem, ListEditor],
  templateUrl: './list-section.html',
  styleUrl: './list-section.scss',
})
export class ListSection {
  @Input() categoryId = '';
  @Input() categoryName = '';
  @Input() items: any[] = [];
  @Input() progress?: { done: number; total: number; percent: number };
  @Output() itemToggled = new EventEmitter<string>();
  @Output() itemDeleted = new EventEmitter<string>();
  @Output() itemAdded = new EventEmitter<Partial<any>>();

  onToggle(itemId: string) {
    this.itemToggled.emit(itemId);
  }

  onRemove(itemId: string) {
    this.itemDeleted.emit(itemId);
  }

  onAdd(payload: Partial<any>) {
    this.itemAdded.emit({ ...payload, categoryId: this.categoryId, categoryName: this.categoryName });
  }
}
