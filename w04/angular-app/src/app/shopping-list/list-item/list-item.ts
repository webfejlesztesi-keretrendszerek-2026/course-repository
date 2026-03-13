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
  @Input() index = 0;
  @Input() sectionId = '';

  @Output() toggle = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  onToggle() {
    this.toggle.emit(this.index);
  }

  onRemove() {
    this.remove.emit(this.index);
  }
}
