import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-editor.html',
  styleUrl: './list-editor.scss',
})
export class ListEditor {
  name = '';
  amount = '';

  @Output() add = new EventEmitter<{ name: string; amount: string }>();

  emitAdd() {
    const n = this.name?.trim();
    if (!n) return;
    this.add.emit({ name: n, amount: this.amount });
    this.name = '';
    this.amount = '';
  }
}
