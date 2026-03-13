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
  @Input() section: any;
  @Output() itemToggled = new EventEmitter<{ sectionId: string; index: number }>();
  @Output() itemDeleted = new EventEmitter<{ sectionId: string; index: number }>();
  @Output() itemAdded = new EventEmitter<{ sectionId: string; name: string; amount: string }>();

  onToggle(index: number) {
    this.itemToggled.emit({ sectionId: this.section.id, index });
  }

  onRemove(index: number) {
    this.itemDeleted.emit({ sectionId: this.section.id, index });
  }

  onAdd(payload: { name: string; amount: string }) {
    this.itemAdded.emit({ sectionId: this.section.id, name: payload.name, amount: payload.amount });
  }
}
