import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListSection } from './list-section/list-section';
import { Section, ShoppingItem } from '../models/shopping';
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
  get sections() {
    return this.shoppingService.sections;
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
  get sectionsProgress() {
    return this.shoppingService.sectionsProgress;
  }

  // delegate actions to the service
  generateList(): void {
    this.shoppingService.generateList();
  }

  clearList(): void {
    this.shoppingService.clearList();
  }

  onItemToggled(payload: { sectionId: string; index: number }) {
    this.shoppingService.onItemToggled(payload);
  }

  onItemDeleted(payload: { sectionId: string; index: number }) {
    this.shoppingService.onItemDeleted(payload);
  }

  onItemAdded(payload: { sectionId: string; name: string; amount: number; unit?: string }) {
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
