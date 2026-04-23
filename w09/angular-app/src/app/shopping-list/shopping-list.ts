import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListSection } from './list-section/list-section';
import { ShoppingItem } from '../models/shopping-list';
import { ShoppingService } from '../services/shopping.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, ListSection],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.scss',
})
export class ShoppingList {
  constructor(private shoppingService: ShoppingService) {}

  // expose service signals/values to the template
  get groups() {
    return this.shoppingService.groupedList();
  }
  get totalItems() {
    return this.shoppingService.totalItems;
  }
  get checkedItems() {
    return this.shoppingService.checkedItems;
  }
  get progressPercent() {
    return this.shoppingService.progressPercent;
  }
  get categoryProgress() {
    return this.shoppingService.categoryProgress;
  }

  // delegate actions to the service
  generateList(): void {
    this.shoppingService.generateList();
  }

  clearList(): void {
    this.shoppingService.clearList();
  }

  onItemToggled(itemId: string) {
    this.shoppingService.onItemToggled(itemId);
  }

  onItemDeleted(itemId: string) {
    this.shoppingService.onItemDeleted(itemId);
  }

  onItemAdded(payload: Partial<ShoppingItem>) {
    this.shoppingService.onItemAdded(payload);
  }

  copyText(): void {
    this.shoppingService.copyText();
  }

  toPlainText(): string {
    return this.shoppingService.toPlainText();
  }

  print(): void {
    this.shoppingService.print();
  }

  resetAll(): void {
    this.shoppingService.resetAll();
  }
}
