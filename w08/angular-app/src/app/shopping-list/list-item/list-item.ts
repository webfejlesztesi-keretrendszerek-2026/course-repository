import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
})
export class ListItem {
  @Input() item: any;

  @Output() toggle = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  onToggle() {
    if (this.item && this.item.id) this.toggle.emit(this.item.id);
  }

  onRemove() {
    if (this.item && this.item.id) this.remove.emit(this.item.id);
  }
}
